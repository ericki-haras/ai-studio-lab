/* ==========================================================================
   Portugal road trip lab — album accordions + lightbox.
   Scoped to this page: reads album/photo groupings straight from the DOM.
   ========================================================================== */
(function () {
  "use strict";

  /* --- album accordions --------------------------------------------------- */
  document.querySelectorAll("[data-album-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.setAttribute("data-open", String(open));
    });
  });

  /* --- lightbox ------------------------------------------------------------ */
  var lightbox = document.querySelector("[data-lightbox]");
  if (!lightbox) return;

  var imgEl = lightbox.querySelector("[data-lightbox-img]");
  var countEl = lightbox.querySelector("[data-lightbox-count]");
  var group = [];
  var index = 0;

  function render() {
    var photo = group[index];
    if (!photo) return;
    imgEl.src = photo.src;
    imgEl.alt = photo.alt;
    if (countEl) countEl.textContent = (index + 1) + " / " + group.length;
  }

  function open(albumSlug, startIndex) {
    var buttons = document.querySelectorAll('[data-photo][data-album="' + albumSlug + '"]');
    group = Array.prototype.map.call(buttons, function (btn) {
      var img = btn.querySelector("img");
      return { src: img.src, alt: img.alt };
    });
    index = startIndex;
    render();
    lightbox.setAttribute("data-open", "true");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.setAttribute("data-open", "false");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function step(delta) {
    if (!group.length) return;
    index = (index + delta + group.length) % group.length;
    render();
  }

  document.querySelectorAll("[data-photo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var albumSlug = btn.getAttribute("data-album");
      var buttons = document.querySelectorAll('[data-photo][data-album="' + albumSlug + '"]');
      var startIndex = Array.prototype.indexOf.call(buttons, btn);
      open(albumSlug, startIndex);
    });
  });

  var closeBtn = lightbox.querySelector("[data-lightbox-close]");
  var prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  var nextBtn = lightbox.querySelector("[data-lightbox-next]");

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.getAttribute("data-open") !== "true") return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
