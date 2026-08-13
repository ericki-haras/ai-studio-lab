/* ==========================================================================
   Nav
   --------------------------------------------------------------------------
   Builds the "Lab" dropdown from window.LABS so that adding one entry to
   labs/labs.js publishes your lab everywhere at once — menu and home page.

   Each page sets window.SITE_ROOT before loading this file so relative
   links resolve from any folder depth.
   ========================================================================== */
(function () {
  "use strict";

  var ROOT = window.SITE_ROOT || "";
  var labs = window.LABS || [];

  var COLORS = {
    cyan: "var(--cyan)",
    magenta: "var(--magenta)",
    amber: "var(--amber)",
    lilac: "var(--lilac)"
  };

  /* --- populate the dropdown -------------------------------------------- */
  var menu = document.querySelector("[data-lab-menu]");

  if (menu) {
    if (!labs.length) {
      menu.innerHTML =
        '<li class="dropdown__empty">No labs yet — yours could be first.</li>';
    } else {
      menu.innerHTML = labs
        .map(function (lab) {
          var color = COLORS[lab.branch] || COLORS.cyan;
          return (
            '<li class="dropdown__item">' +
            '<a href="' + ROOT + "labs/" + lab.slug + '/" style="--item-color:' + color + '">' +
            "<span>" + lab.name + "</span>" +
            '<span class="dropdown__meta">' + lab.slug + "</span>" +
            "</a></li>"
          );
        })
        .join("");
    }
  }

  /* --- dropdown open / close -------------------------------------------- */
  var toggle = document.querySelector("[data-lab-toggle]");
  var panel = document.querySelector("[data-lab-panel]");

  if (toggle && panel) {
    var open = function (state) {
      toggle.setAttribute("aria-expanded", String(state));
      panel.setAttribute("data-open", String(state));
    };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      open(toggle.getAttribute("aria-expanded") !== "true");
    });

    // click outside closes
    document.addEventListener("click", function (e) {
      if (!panel.contains(e.target) && e.target !== toggle) open(false);
    });

    // escape closes and returns focus to the trigger
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        open(false);
        toggle.focus();
      }
    });

    // pointer users get hover, but only on devices that actually hover
    var group = toggle.closest(".navgroup");
    if (group && window.matchMedia("(hover:hover) and (min-width:721px)").matches) {
      var timer;
      group.addEventListener("mouseenter", function () {
        clearTimeout(timer);
        open(true);
      });
      group.addEventListener("mouseleave", function () {
        timer = setTimeout(function () { open(false); }, 180);
      });
    }
  }

  /* --- lab cards on the home page --------------------------------------- */
  var grid = document.querySelector("[data-lab-grid]");

  if (grid) {
    var cards = labs
      .map(function (lab) {
        var color = COLORS[lab.branch] || COLORS.cyan;
        return (
          '<a class="labcard" href="' + ROOT + "labs/" + lab.slug + '/" style="--c:' + color + '">' +
          '<div class="labcard__branch">lab/' + lab.slug + "</div>" +
          '<h3 class="labcard__name">' + lab.name + "</h3>" +
          '<p class="labcard__desc">' + lab.blurb + "</p>" +
          '<div class="labcard__foot"><span>' + lab.owner + "</span><span>" + lab.added + "</span></div>" +
          "</a>"
        );
      })
      .join("");

    var ghost =
      '<a class="labcard labcard--ghost" href="#ship">' +
      '<span class="plus">+</span>' +
      '<span class="mono" style="font-size:11.5px;letter-spacing:.09em;text-transform:uppercase">Add your lab</span>' +
      "</a>";

    grid.innerHTML = cards + ghost;
  }

  /* --- count badge ------------------------------------------------------ */
  var count = document.querySelector("[data-lab-count]");
  if (count) count.textContent = String(labs.length).padStart(2, "0");
})();
