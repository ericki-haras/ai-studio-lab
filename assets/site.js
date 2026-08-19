/* ==========================================================================
   Site behaviour — scroll reveals, commit-node lighting, copy buttons
   ========================================================================== */
(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- reveal on scroll -------------------------------------------------- */
  var watched = document.querySelectorAll(".reveal, .step, [data-node]");

  if (calm || !("IntersectionObserver" in window)) {
    watched.forEach(function (el) { el.classList.add("is-seen"); });
    document.querySelectorAll("[data-node]").forEach(function (el) {
      el.classList.add("node--lit");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-seen");
          if (entry.target.hasAttribute("data-node")) {
            entry.target.classList.add("node--lit");
          }
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.02 }
    );
    watched.forEach(function (el) { io.observe(el); });
  }

  /* --- copy to clipboard ------------------------------------------------- */
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".code");
      var pre = block && block.querySelector("pre");
      if (!pre) return;

      // strip comment lines so people paste runnable commands only
      var text = pre.innerText
        .split("\n")
        .filter(function (line) { return line.trim() && line.trim()[0] !== "#"; })
        .join("\n");

      var done = function () {
        var original = btn.textContent;
        btn.textContent = "Copied";
        btn.setAttribute("data-done", "true");
        setTimeout(function () {
          btn.textContent = original;
          btn.removeAttribute("data-done");
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* --- collapsible workflow section --------------------------------------- */
  var workflowToggle = document.querySelector("[data-workflow-toggle]");
  var workflowPanel = document.querySelector("[data-workflow-panel]");
  var workflowLabel = document.querySelector("[data-workflow-toggle-label]");

  if (workflowToggle && workflowPanel) {
    workflowToggle.addEventListener("click", function () {
      var open = workflowToggle.getAttribute("aria-expanded") !== "true";
      workflowToggle.setAttribute("aria-expanded", String(open));
      workflowPanel.setAttribute("data-open", String(open));
      if (workflowLabel) workflowLabel.textContent = open ? "Hide steps" : "Show steps";

      // steps collapsed at zero height never cross the IntersectionObserver's
      // threshold, so force their reveal animation the first time they open
      if (open) {
        workflowPanel.querySelectorAll(".step").forEach(function (el) {
          el.classList.add("is-seen");
        });
      }
    });
  }

  /* --- token swatch demo (Haras' Lab) ------------------------------------ */
  document.querySelectorAll("[data-swatches] button").forEach(function (sw) {
    sw.addEventListener("click", function () {
      var hex = sw.getAttribute("data-hex");
      var out = document.querySelector("[data-swatch-out]");
      if (out && hex) out.textContent = hex;
    });
  });
})();
