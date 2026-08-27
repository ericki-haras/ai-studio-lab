/* ==========================================================================
   Bloom Drift — a tiny side-scrolling drive-and-collect toy
   --------------------------------------------------------------------------
   The car stays put on the left; the road and grass scroll right-to-left to
   read as forward motion. Holding up/down (or the on-screen buttons) moves
   the car within the asphalt lane. Flowers spawn on the right, drift left,
   and score on contact — there's no fail state, just driving and collecting.

   Gameplay (speeds, spawn timing, collision, input) is unchanged from the
   original build. Every visual element is a real sprite cropped from the
   Bloom Drift asset sheet (see labs/anna-guercio/assets/) rather than
   hand-drawn SVG/CSS — this file only ever swaps <img> src attributes or
   moves/sizes elements; it never draws anything itself.
   ========================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector("[data-drive-stage]");
  if (!stage) return;

  var road = stage.querySelector("[data-drive-road]");
  var carEl = stage.querySelector("[data-drive-car]");
  var carImgEl = stage.querySelector("[data-drive-car-img]");
  var flowersEl = stage.querySelector("[data-drive-flowers]");
  var grassTop = stage.querySelector("[data-drive-grass-top]");
  var grassBottom = stage.querySelector("[data-drive-grass-bottom]");
  var grassFlowersTop = stage.querySelector("[data-drive-grass-flowers-top]");
  var grassFlowersBottom = stage.querySelector("[data-drive-grass-flowers-bottom]");
  var hudEl = stage.querySelector("[data-drive-score]");
  var countEl = stage.querySelector("[data-drive-count]");
  var trailEl = stage.querySelector("[data-drive-trail]");
  var trailImgEl = stage.querySelector("[data-drive-trail-img]");
  var upBtn = document.querySelector("[data-drive-up]");
  var downBtn = document.querySelector("[data-drive-down]");
  var restartBtn = document.querySelector("[data-drive-restart]");

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SCROLL_SPEED = 145;   // px/s — road + grass background scroll
  var CAR_SPEED = 160;      // px/s — vertical car movement
  var FLOWER_SPEED = 145;   // px/s — must match SCROLL_SPEED so flowers read as fixed to the road
  var FLOWER_SIZE = 42;
  var PAD = 6;
  var MAX_FLOWERS = 3;
  var MIN_GAP_Y = 56;
  var SPAWN_MIN = 900;
  var SPAWN_MAX = 1900;

  var FLOWER_SPRITES = [
    "assets/flowers/flower-1.png",
    "assets/flowers/flower-2.png",
    "assets/flowers/flower-3.png",
    "assets/flowers/flower-4.png",
    "assets/flowers/flower-5.png",
    "assets/flowers/flower-6.png"
  ];
  var PARTICLE_SPRITES = [
    "assets/effects/particle-flower.png",
    "assets/effects/particle-star.png",
    "assets/effects/particle-diamond.png"
  ];
  var CAR_FRAMES = [
    "assets/player/car-driver-frame-1.png",
    "assets/player/car-driver-frame-2.png",
    "assets/player/car-driver-frame-3.png"
  ];
  var CAR_IDLE = "assets/player/car-driver-idle.png";
  var CAR_FRAME_INTERVAL = 120; // ms between sprite-animation frames while moving

  var RAINBOW_FRAMES = [
    "assets/effects/rainbow-frame-1.png",
    "assets/effects/rainbow-frame-2.png",
    "assets/effects/rainbow-frame-3.png",
    "assets/effects/rainbow-frame-4.png"
  ];
  var RAINBOW_FRAME_INTERVAL = 150; // ms between rainbow-trail frames while active

  var DECOR_SPRITE = "assets/environment/decor-butterfly.png";

  /* decorative grass sprites — purely visual scenery in the grass strips.
     They're never checked against the car and never removed on contact;
     they just drift left with the scroll and wrap back around. */
  var DECOR_FLOWER_COUNT = 2;  // per grass strip — sparse, the tile art already carries most of the detail
  var DECOR_FLOWER_SIZE = 34;
  var DECOR_PAD = 4;

  /* speed progression: SCROLL_SPEED/FLOWER_SPEED above stay the *base* values —
     everything below scales them by a multiplier derived from the score, so
     the original constants are never edited, only multiplied at use-time. */
  var SPEED_GROWTH_FACTOR = Math.pow(2, 1 / 12); // multiplier ~doubles every 12 flowers
  var MAX_SPEED_MULTIPLIER = 3.4;                // hard cap so it stays playable
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
  var carAnimState = "idle";
  var carFrameIndex = 0;
  var carFrameTimer = 0;

  /* speed progression + rainbow trail state */
  var targetSpeedMultiplier = 1;
  var currentSpeedMultiplier = 1;
  var trailIntensity = 0;
  var trailFrameIndex = 0;
  var trailFrameTimer = 0;

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

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* exponential, capped: 0 flowers → 1x, 5 → ~1.3x, 12 → 2x, 20 → ~3.2x, 21+ → capped at 3.4x */
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

    var el = document.createElement("div");
    el.className = "drive-flower";

    /* the art lives in its own child so the CSS bob/rotate animation and
       the per-frame JS position transform never fight over `transform` */
    var art = document.createElement("div");
    art.className = "drive-flower__art";
    art.style.setProperty("--flower-rot", (Math.random() * 16 - 8).toFixed(1) + "deg");
    art.style.setProperty("--flower-scale", (0.85 + Math.random() * 0.3).toFixed(2));
    art.style.animationDelay = (Math.random() * 1.8).toFixed(2) + "s";

    var img = document.createElement("img");
    img.className = "pixel-img";
    img.src = pick(FLOWER_SPRITES);
    img.alt = "";
    art.appendChild(img);
    el.appendChild(art);

    var x = road.clientWidth;
    el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    flowersEl.appendChild(el);

    flowers.push({ el: el, x: x, y: y });
  }

  /* --- decorative grass sprites --------------------------------------------
     A sparse butterfly or two per strip, scrolling at the same rate as the
     grass background so it never looks detached from the scenery, wrapping
     back around the right edge forever. */
  function spawnDecorFlower(container, containerHeight, x) {
    var y = DECOR_PAD + Math.random() * Math.max(0, containerHeight - DECOR_FLOWER_SIZE - DECOR_PAD * 2);

    var el = document.createElement("div");
    el.className = "drive-decor-flower";
    el.setAttribute("aria-hidden", "true");

    var img = document.createElement("img");
    img.className = "pixel-img";
    img.src = DECOR_SPRITE;
    img.alt = "";
    el.appendChild(img);

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
      p.style.setProperty("--px", (Math.cos(angle) * dist).toFixed(1) + "px");
      p.style.setProperty("--py", (Math.sin(angle) * dist).toFixed(1) + "px");

      var img = document.createElement("img");
      img.className = "pixel-img";
      img.src = pick(PARTICLE_SPRITES);
      img.alt = "";
      p.appendChild(img);
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
    trailFrameIndex = 0;
    trailFrameTimer = 0;
    if (trailEl) {
      trailEl.style.opacity = "0";
      trailEl.style.transform = "translateY(-48%) scaleX(.45)";
    }
    if (trailImgEl) trailImgEl.src = RAINBOW_FRAMES[0];

    keys.up = false;
    keys.down = false;
    carTilt = 0;
    carBounce = 0;
    bouncePhase = 0;
    carAnimState = "idle";
    carFrameIndex = 0;
    carFrameTimer = 0;
    if (carImgEl) carImgEl.src = CAR_IDLE;
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
       multiplier approaches the cap — drives opacity/length/frame-cycling */
    var rainbowTarget = clamp(
      (currentSpeedMultiplier - RAINBOW_THRESHOLD) / (MAX_SPEED_MULTIPLIER - RAINBOW_THRESHOLD),
      0, 1
    );
    trailIntensity += (rainbowTarget - trailIntensity) * Math.min(dt * SPEED_EASE_RATE, 1);
    if (trailEl) {
      trailEl.style.opacity = trailIntensity.toFixed(3);
      trailEl.style.transform = "translateY(-48%) scaleX(" + (0.45 + trailIntensity * 0.55).toFixed(3) + ")";
    }
    if (trailImgEl) {
      if (trailIntensity > 0.03) {
        trailFrameTimer += dt * 1000;
        if (trailFrameTimer > RAINBOW_FRAME_INTERVAL) {
          trailFrameTimer = 0;
          trailFrameIndex = (trailFrameIndex + 1) % RAINBOW_FRAMES.length;
          trailImgEl.src = RAINBOW_FRAMES[trailFrameIndex];
        }
      } else if (trailFrameIndex !== 0) {
        trailFrameIndex = 0;
        trailFrameTimer = 0;
        trailImgEl.src = RAINBOW_FRAMES[0];
      }
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

    /* cycle the provided car+driver animation frames while moving, back to
       the idle sprite at rest — swaps <img src>, never redraws the sprite */
    if (carImgEl) {
      if (!calm && dy !== 0) {
        if (carAnimState !== "moving") {
          carAnimState = "moving";
          carFrameIndex = 0;
          carFrameTimer = 0;
          carImgEl.src = CAR_FRAMES[0];
        }
        carFrameTimer += dt * 1000;
        if (carFrameTimer > CAR_FRAME_INTERVAL) {
          carFrameTimer = 0;
          carFrameIndex = (carFrameIndex + 1) % CAR_FRAMES.length;
          carImgEl.src = CAR_FRAMES[carFrameIndex];
        }
      } else if (carAnimState !== "idle") {
        carAnimState = "idle";
        carImgEl.src = CAR_IDLE;
      }
    }

    /* background scroll is the one thing reduced motion turns off */
    if (!calm) {
      var scrollDelta = SCROLL_SPEED * currentSpeedMultiplier * dt;
      scrollOffset += scrollDelta;
      var off = -scrollOffset + "px";
      grassTop.style.backgroundPositionX = off;
      grassBottom.style.backgroundPositionX = off;
      road.style.backgroundPositionX = off;

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
