/* ==========================================================================
   Bloom Drift — a tiny side-scrolling drive-and-collect toy
   --------------------------------------------------------------------------
   The car stays put on the left; the road and grass scroll right-to-left to
   read as forward motion. Holding up/down (or the on-screen buttons) moves
   the car within the asphalt lane. Flowers spawn on the right, drift left,
   and score on contact — there's no fail state, just driving and collecting.

   Gameplay (speeds, spawn timing, collision, input) is unchanged from the
   original build. Everything added since is purely decorative: a bit of
   suspension lean/bounce on the car, a bob on each flower, a particle burst
   and HUD bump on collection — none of it touches carY, flower.x/y, score
   timing, or the hitboxes those decorations sit on top of.
   ========================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector("[data-drive-stage]");
  if (!stage) return;

  var road = stage.querySelector("[data-drive-road]");
  var carEl = stage.querySelector("[data-drive-car]");
  var flowersEl = stage.querySelector("[data-drive-flowers]");
  var grassTop = stage.querySelector("[data-drive-grass-top]");
  var grassBottom = stage.querySelector("[data-drive-grass-bottom]");
  var grassFlowersTop = stage.querySelector("[data-drive-grass-flowers-top]");
  var grassFlowersBottom = stage.querySelector("[data-drive-grass-flowers-bottom]");
  var laneLine = stage.querySelector("[data-drive-line]");
  var hudEl = stage.querySelector("[data-drive-score]");
  var countEl = stage.querySelector("[data-drive-count]");
  var trailEl = stage.querySelector("[data-drive-trail]");
  var upBtn = document.querySelector("[data-drive-up]");
  var downBtn = document.querySelector("[data-drive-down]");
  var restartBtn = document.querySelector("[data-drive-restart]");

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SCROLL_SPEED = 90;    // px/s — road + grass background scroll
  var CAR_SPEED = 160;      // px/s — vertical car movement
  var FLOWER_SPEED = 90;    // px/s — matches scroll speed so flowers read as fixed to the road
  var FLOWER_SIZE = 42;
  var PAD = 6;
  var MAX_FLOWERS = 3;
  var MIN_GAP_Y = 56;
  var SPAWN_MIN = 900;
  var SPAWN_MAX = 1900;
  /* soft-but-vivid base/deeper pairs — pink, buttercup, lavender, peach,
     sky, coral — so each flower gets a gentle shading band instead of one
     flat colour, and the road reads as a lot more colourful at a glance */
  var FLOWER_COLORS = [
    { base: "#FF8AC0", dark: "#E2589C" },
    { base: "#FFDD6B", dark: "#F0B93E" },
    { base: "#B892F0", dark: "#9868DE" },
    { base: "#FFAD7A", dark: "#F08A4E" },
    { base: "#7FD4E8", dark: "#4FB0C9" },
    { base: "#FF7F8A", dark: "#E85560" }
  ];
  var PARTICLE_COLORS = ["#FF8AC0", "#FFDD6B", "#B892F0", "#7FD4E8"];

  /* decorative grass flowers — purely visual scenery in the grass strips.
     They're never checked against the car and never removed on contact;
     they just drift left with the scroll and wrap back around. */
  var DECOR_FLOWER_COUNT = 7;  // per grass strip (top + bottom)
  var DECOR_FLOWER_SIZE = 42;  // matches FLOWER_SIZE, so road and grass flowers read as the same object
  var DECOR_PAD = 4;

  /* speed progression: SCROLL_SPEED/FLOWER_SPEED above stay the *base* values —
     everything below scales them by a multiplier derived from the score, so
     the original constants are never edited, only multiplied at use-time. */
  var SPEED_GROWTH_FACTOR = Math.pow(2, 1 / 10); // multiplier ~doubles every 10 flowers
  var MAX_SPEED_MULTIPLIER = 4.5;                // hard cap so it stays playable
  var SPEED_EASE_RATE = 1.4;                     // per-second ease toward the target — the "momentum" feel
  var RAINBOW_THRESHOLD = 2.2;                   // multiplier at which the trail starts fading in
  var RAINBOW_BOOST_AT = 0.6;                    // trail intensity (0-1) at which extra particles kick in

  var keys = { up: false, down: false };
  var carY = 0;
  var maxCarY = 0;
  var carLeft = 0, carWidth = 0, carHeight = 0, carBaseTop = 0;
  var initialized = false;

  /* decorative suspension state — never read by collision or spawn logic */
  var carTilt = 0;
  var carBounce = 0;
  var bouncePhase = 0;

  /* speed progression + rainbow trail state */
  var targetSpeedMultiplier = 1;
  var currentSpeedMultiplier = 1;
  var trailIntensity = 0;

  var flowers = [];
  var score = 0;
  var scrollOffset = 0;
  var spawnTimer = 0;
  var nextSpawnGap = randSpawnGap();
  var lastSpawnY = null;

  var decorTop = [];
  var decorBottom = [];

  var lastTs = 0;
  var rafId = null;

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function randSpawnGap() {
    return SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
  }

  /* exponential, capped: 0 flowers → 1x, 5 → ~1.4x, 10 → 2x, 20 → 4x, 25+ → capped at 4.5x */
  function speedMultiplierForScore(s) {
    return Math.min(MAX_SPEED_MULTIPLIER, Math.pow(SPEED_GROWTH_FACTOR, s));
  }

  function applyCarTransform() {
    carEl.style.transform =
      "translateY(" + (carY + carBounce) + "px) rotate(" + carTilt.toFixed(2) + "deg)";
  }

  function measure() {
    carWidth = carEl.offsetWidth;
    carHeight = carEl.offsetHeight;
    carLeft = carEl.offsetLeft;
    carBaseTop = carEl.offsetTop;
    maxCarY = Math.max(0, road.clientHeight - carHeight - PAD * 2);

    if (!initialized) {
      carY = maxCarY / 2;
      initialized = true;
    } else {
      carY = clamp(carY, 0, maxCarY);
    }
    applyCarTransform();
  }

  function buildFlowerSvg(color) {
    /* a compact head (top ~2/3 of the viewBox) leaves room for a visible
       stem + leaf underneath instead of one drawn over the other */
    return (
      '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' +
        '<ellipse class="drive-petal-shadow" cx="11" cy="20" rx="4.5" ry="1.1"></ellipse>' +
        '<path class="drive-stem" d="M11,11.5 L11,19"></path>' +
        '<ellipse class="drive-leaf" cx="8.4" cy="16" rx="2.3" ry="1.3" transform="rotate(-25 8.4 16)"></ellipse>' +
        '<g fill="' + color.base + '">' +
          '<ellipse cx="11" cy="4.3" rx="3.2" ry="2.5"></ellipse>' +
          '<ellipse cx="14.7" cy="8" rx="2.5" ry="3.2"></ellipse>' +
          '<ellipse cx="11" cy="11.7" rx="3.2" ry="2.5"></ellipse>' +
          '<ellipse cx="7.3" cy="8" rx="2.5" ry="3.2"></ellipse>' +
        '</g>' +
        /* one soft shade band, bottom-right, for a little pixel-shaded depth */
        '<ellipse cx="13.5" cy="9.5" rx="1.7" ry="2.3" fill="' + color.dark + '" opacity=".8"></ellipse>' +
        '<ellipse class="drive-petal-shine" cx="9.7" cy="4.9" rx=".9" ry=".6"></ellipse>' +
        '<circle cx="11" cy="8" r="2.6" fill="#FFC94D"></circle>' +
      '</svg>'
    );
  }

  function spawnFlower() {
    var maxY = road.clientHeight - FLOWER_SIZE - PAD;
    var minY = PAD;
    if (maxY <= minY) return;

    var y, attempts = 0;
    do {
      y = minY + Math.random() * (maxY - minY);
      attempts++;
    } while (lastSpawnY !== null && Math.abs(y - lastSpawnY) < MIN_GAP_Y && attempts < 6);
    lastSpawnY = y;

    var color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];

    var el = document.createElement("div");
    el.className = "drive-flower";

    /* the art lives in its own child so the CSS bob/rotate animation and
       the per-frame JS position transform never fight over `transform` */
    var art = document.createElement("div");
    art.className = "drive-flower__art";
    art.style.setProperty("--flower-rot", (Math.random() * 16 - 8).toFixed(1) + "deg");
    art.style.setProperty("--flower-scale", (0.85 + Math.random() * 0.3).toFixed(2));
    art.style.animationDelay = (Math.random() * 1.8).toFixed(2) + "s";
    art.innerHTML = buildFlowerSvg(color);
    el.appendChild(art);

    var x = road.clientWidth;
    el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    flowersEl.appendChild(el);

    flowers.push({ el: el, x: x, y: y });
  }

  /* --- decorative grass flowers -------------------------------------------
     Same flower artwork as the collectibles, just smaller and non-interactive.
     They scroll at the same rate as the grass background so they never look
     detached from the scenery, and wrap back around the right edge forever. */
  function spawnDecorFlower(container, containerHeight, x) {
    var color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
    var y = DECOR_PAD + Math.random() * Math.max(0, containerHeight - DECOR_FLOWER_SIZE - DECOR_PAD * 2);

    var el = document.createElement("div");
    el.className = "drive-decor-flower";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = buildFlowerSvg(color);
    el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    container.appendChild(el);

    return { el: el, x: x, y: y };
  }

  function initDecorFlowers(container, containerWidth, containerHeight) {
    var list = [];
    for (var i = 0; i < DECOR_FLOWER_COUNT; i++) {
      var x = (containerWidth / DECOR_FLOWER_COUNT) * i + Math.random() * 30;
      list.push(spawnDecorFlower(container, containerHeight, x));
    }
    return list;
  }

  function updateDecorFlowers(list, containerWidth, containerHeight, delta) {
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      f.x -= delta;
      if (f.x < -DECOR_FLOWER_SIZE) {
        f.x = containerWidth + Math.random() * 40;
        f.y = DECOR_PAD + Math.random() * Math.max(0, containerHeight - DECOR_FLOWER_SIZE - DECOR_PAD * 2);
      }
      f.el.style.transform = "translate3d(" + f.x + "px," + f.y + "px,0)";
    }
  }

  function isColliding(flower) {
    var carTop = carBaseTop + carY;
    var carBottom = carTop + carHeight;
    var carRight = carLeft + carWidth;

    var fRight = flower.x + FLOWER_SIZE;
    var fBottom = flower.y + FLOWER_SIZE;

    return carLeft < fRight && carRight > flower.x && carTop < fBottom && carBottom > flower.y;
  }

  function bumpHud() {
    hudEl.classList.remove("is-bumped");
    void hudEl.offsetWidth; /* restart the animation even on rapid, back-to-back collects */
    hudEl.classList.add("is-bumped");
  }

  function burstParticles(x, y) {
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      var dist = 14 + Math.random() * 10;

      var p = document.createElement("span");
      p.className = "drive-particle";
      p.style.left = (x + FLOWER_SIZE / 2) + "px";
      p.style.top = (y + FLOWER_SIZE / 2) + "px";
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      p.style.setProperty("--px", (Math.cos(angle) * dist).toFixed(1) + "px");
      p.style.setProperty("--py", (Math.sin(angle) * dist).toFixed(1) + "px");
      flowersEl.appendChild(p);

      (function (el) {
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 520);
      })(p);
    }
  }

  function collectFlower(i) {
    var flower = flowers[i];
    flowers.splice(i, 1);

    score++;
    countEl.textContent = score;
    bumpHud();
    targetSpeedMultiplier = speedMultiplierForScore(score);
    if (!calm) burstParticles(flower.x, flower.y);

    flower.el.classList.add("is-collected");
    setTimeout(function () {
      if (flower.el.parentNode) flower.el.parentNode.removeChild(flower.el);
    }, 220);
  }

  function dropFlower(i) {
    var flower = flowers[i];
    flowers.splice(i, 1);
    if (flower.el.parentNode) flower.el.parentNode.removeChild(flower.el);
  }

  function resetGame() {
    /* clear every active flower and any in-flight collect particles */
    for (var i = flowers.length - 1; i >= 0; i--) {
      if (flowers[i].el.parentNode) flowers[i].el.parentNode.removeChild(flowers[i].el);
    }
    flowers.length = 0;

    var stray = flowersEl.querySelectorAll(".drive-particle");
    for (var j = 0; j < stray.length; j++) {
      if (stray[j].parentNode) stray[j].parentNode.removeChild(stray[j]);
    }

    spawnTimer = 0;
    nextSpawnGap = randSpawnGap();
    lastSpawnY = null;

    /* score + speed snap back immediately — a clean run, not an eased one */
    score = 0;
    countEl.textContent = "0";
    targetSpeedMultiplier = 1;
    currentSpeedMultiplier = 1;

    trailIntensity = 0;
    if (trailEl) {
      trailEl.style.opacity = "0";
      trailEl.style.transform = "scaleX(.45)";
      trailEl.classList.remove("is-boosted");
    }

    keys.up = false;
    keys.down = false;
    carTilt = 0;
    carBounce = 0;
    bouncePhase = 0;
    carY = maxCarY / 2;
    applyCarTransform();
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    /* car movement always runs, even under reduced motion */
    var dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    if (dy !== 0) {
      carY = clamp(carY + dy * CAR_SPEED * dt, 0, maxCarY);
    }

    /* speed progression: ease the applied multiplier toward the target set on
       collection, so it accelerates smoothly rather than snapping — this is
       the only thing that scales SCROLL_SPEED/FLOWER_SPEED; CAR_SPEED (the
       steering speed) is untouched, so the car stays just as controllable */
    currentSpeedMultiplier += (targetSpeedMultiplier - currentSpeedMultiplier) * Math.min(dt * SPEED_EASE_RATE, 1);

    /* rainbow trail intensity: 0 below the threshold, easing toward 1 as the
       multiplier approaches the cap — drives opacity/length/particle count */
    var rainbowTarget = clamp(
      (currentSpeedMultiplier - RAINBOW_THRESHOLD) / (MAX_SPEED_MULTIPLIER - RAINBOW_THRESHOLD),
      0, 1
    );
    trailIntensity += (rainbowTarget - trailIntensity) * Math.min(dt * SPEED_EASE_RATE, 1);
    if (trailEl) {
      trailEl.style.opacity = trailIntensity.toFixed(3);
      trailEl.style.transform = "scaleX(" + (0.45 + trailIntensity * 0.55).toFixed(3) + ")";
      trailEl.classList.toggle("is-boosted", trailIntensity > RAINBOW_BOOST_AT);
    }

    /* decorative suspension lean + bounce — eases toward the current input,
       never alters carY itself, so the hitbox tracks the same path as before.
       Bounce amplitude grows slightly with speed for a more energetic feel. */
    var tiltTarget = calm ? 0 : dy * -6;
    carTilt += (tiltTarget - carTilt) * Math.min(dt * 10, 1);
    if (!calm && dy !== 0) {
      bouncePhase += dt * 14;
      carBounce = Math.sin(bouncePhase) * (1.6 + (currentSpeedMultiplier - 1) * 0.5);
    } else {
      bouncePhase = 0;
      carBounce += (0 - carBounce) * Math.min(dt * 10, 1);
    }
    applyCarTransform();

    /* background scroll is the one thing reduced motion turns off */
    if (!calm) {
      var scrollDelta = SCROLL_SPEED * currentSpeedMultiplier * dt;
      scrollOffset += scrollDelta;
      var off = -scrollOffset + "px";
      laneLine.style.backgroundPositionX = off;
      grassTop.style.backgroundPositionX = off;
      grassBottom.style.backgroundPositionX = off;

      if (grassFlowersTop) {
        updateDecorFlowers(decorTop, grassFlowersTop.clientWidth, grassFlowersTop.clientHeight, scrollDelta);
      }
      if (grassFlowersBottom) {
        updateDecorFlowers(decorBottom, grassFlowersBottom.clientWidth, grassFlowersBottom.clientHeight, scrollDelta);
      }
    }

    /* flowers keep drifting (slower under reduced motion) and collecting */
    var speed = (calm ? FLOWER_SPEED * 0.4 : FLOWER_SPEED) * currentSpeedMultiplier;
    for (var i = flowers.length - 1; i >= 0; i--) {
      var flower = flowers[i];
      flower.x -= speed * dt;

      if (isColliding(flower)) {
        collectFlower(i);
        continue;
      }
      if (flower.x < -FLOWER_SIZE) {
        dropFlower(i);
        continue;
      }
      flower.el.style.transform = "translate3d(" + flower.x + "px," + flower.y + "px,0)";
    }

    spawnTimer += dt * 1000;
    if (spawnTimer >= nextSpawnGap && flowers.length < MAX_FLOWERS) {
      spawnTimer = 0;
      nextSpawnGap = randSpawnGap();
      spawnFlower();
    }

    rafId = requestAnimationFrame(tick);
  }

  /* --- keyboard: held-state flags, scoped to the stage so arrow keys don't
     hijack page scrolling until the player actually focuses the game ------- */
  function setKey(code, val, evt) {
    if (code === "ArrowUp" || code === "KeyW") {
      keys.up = val;
      if (evt) evt.preventDefault();
    } else if (code === "ArrowDown" || code === "KeyS") {
      keys.down = val;
      if (evt) evt.preventDefault();
    }
  }

  stage.addEventListener("keydown", function (e) { setKey(e.code, true, e); });
  stage.addEventListener("keyup", function (e) { setKey(e.code, false, e); });

  /* --- touch / on-screen buttons ------------------------------------------ */
  function bindHold(btn, key) {
    if (!btn) return;
    var press = function (e) { e.preventDefault(); keys[key] = true; };
    var release = function () { keys[key] = false; };
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("pointercancel", release);
  }
  bindHold(upBtn, "up");
  bindHold(downBtn, "down");

  if (restartBtn) restartBtn.addEventListener("click", resetGame);

  /* --- resize + visibility ------------------------------------------------ */
  window.addEventListener("resize", measure);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      lastTs = 0;
      rafId = requestAnimationFrame(tick);
    }
  });

  measure();
  if (grassFlowersTop) decorTop = initDecorFlowers(grassFlowersTop, grassFlowersTop.clientWidth, grassFlowersTop.clientHeight);
  if (grassFlowersBottom) decorBottom = initDecorFlowers(grassFlowersBottom, grassFlowersBottom.clientWidth, grassFlowersBottom.clientHeight);
  rafId = requestAnimationFrame(tick);
})();
