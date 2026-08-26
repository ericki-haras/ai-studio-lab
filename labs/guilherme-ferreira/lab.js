/* ==========================================================================
   lab/guilherme-ferreira — page behaviour
   --------------------------------------------------------------------------
   Two independent demos, both local to this page:
     1. a commit-message linter built from the rules in CONTRIBUTING.md
     2. a toggle that counts the changed lines in two versions of one diff
   Nothing here touches the shared assets, and nothing leaves the browser.
   ========================================================================== */
(function () {
  "use strict";

  /* ======================================================================
     01 — commit message linter
     ====================================================================== */
  var input = document.querySelector("[data-gf-input]");
  var ruleList = document.querySelector("[data-gf-rules]");
  var scoreOut = document.querySelector("[data-gf-score]");

  // messages a reviewer has to open the diff to understand
  var EMPTY_WORDS = ["updates", "update", "wip", "changes", "fix", "fix stuff", "stuff", "misc", "final"];

  // past tense and gerunds are the two ways an imperative subject goes wrong
  var NOT_IMPERATIVE = /^(added|adds|adding|fixed|fixes|fixing|removed|removes|removing|updated|updates|updating|changed|changes|changing)\b/i;

  var RULES = [
    {
      label: "Subject is 50 characters or fewer",
      hint: function (s) { return s.subject.length + " characters"; },
      test: function (s) { return s.subject.length > 0 && s.subject.length <= 50; }
    },
    {
      label: "Subject describes the change, not \"updates\"",
      hint: function () { return "avoid: " + EMPTY_WORDS.slice(0, 4).join(", "); },
      test: function (s) { return EMPTY_WORDS.indexOf(s.subject.trim().toLowerCase()) === -1; }
    },
    {
      label: "Subject is in the imperative — \"Add\", not \"Added\"",
      hint: function (s) { return s.firstWord ? "starts with \"" + s.firstWord + "\"" : "nothing to check yet"; },
      test: function (s) { return s.firstWord.length > 0 && !NOT_IMPERATIVE.test(s.firstWord); }
    },
    {
      label: "Subject starts with a capital",
      hint: function () { return "\"Add lab page for Ana\""; },
      test: function (s) { return /^[A-Z]/.test(s.subject); }
    },
    {
      label: "No full stop at the end of the subject",
      hint: function () { return "a subject line is a title, not a sentence"; },
      test: function (s) { return !/\.$/.test(s.subject.trim()); }
    },
    {
      label: "Body, if there is one, sits after a blank line",
      hint: function (s) { return s.hasBody ? "body found" : "no body — that's fine"; },
      test: function (s) { return !s.hasBody || s.lines[1] === ""; }
    }
  ];

  function parse(text) {
    var lines = text.replace(/\r/g, "").split("\n");
    var subject = lines[0] || "";
    return {
      lines: lines,
      subject: subject,
      firstWord: (subject.trim().split(/\s+/)[0] || ""),
      // anything non-blank below the subject counts as a body
      hasBody: lines.slice(1).some(function (line) { return line.trim() !== ""; })
    };
  }

  function renderLint() {
    var state = parse(input.value);
    var passing = 0;

    ruleList.innerHTML = "";

    RULES.forEach(function (rule) {
      var ok = rule.test(state);
      if (ok) passing++;

      var li = document.createElement("li");
      li.className = "gf-rule " + (ok ? "gf-rule--pass" : "gf-rule--fail");

      var mark = document.createElement("span");
      mark.className = "gf-rule__mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = ok ? "✓" : "✗";

      var body = document.createElement("span");
      body.textContent = rule.label;

      var hint = document.createElement("span");
      hint.className = "gf-rule__hint";
      hint.textContent = rule.hint(state);
      body.appendChild(hint);

      li.appendChild(mark);
      li.appendChild(body);
      ruleList.appendChild(li);
    });

    scoreOut.innerHTML = "<strong>" + passing + " / " + RULES.length + "</strong> checks passing";
  }

  if (input && ruleList && scoreOut) {
    input.addEventListener("input", renderLint);

    document.querySelectorAll("[data-gf-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        input.value = btn.getAttribute("data-gf-preset");
        renderLint();
        input.focus();
      });
    });

    renderLint();
  }

  /* ======================================================================
     02 — diff size toggle
     ====================================================================== */
  var clean = document.querySelector("[data-gf-diff='clean']");
  var noisy = document.querySelector("[data-gf-diff='noisy']");
  var toggle = document.querySelector("[data-gf-toggle]");
  var diffLabel = document.querySelector("[data-gf-diff-label]");
  var countOut = document.querySelector("[data-gf-count]");
  var realOut = document.querySelector("[data-gf-real]");
  var verdictOut = document.querySelector("[data-gf-verdict]");

  // count the +/- lines actually rendered, so the number can't drift from the block
  function countChanges(pre) {
    return pre.innerText.split("\n").filter(function (line) {
      var first = line.trim()[0];
      return first === "+" || first === "-";
    }).length;
  }

  function renderDiff(reformatted) {
    clean.hidden = reformatted;
    noisy.hidden = !reformatted;

    var shown = countChanges(reformatted ? noisy : clean);
    var intended = countChanges(clean);

    countOut.textContent = shown;
    realOut.textContent = intended;
    diffLabel.textContent = "labs/labs.js — " + (reformatted ? "after format-on-save" : "your change");
    toggle.textContent = reformatted ? "Undo reformat" : "Reformat on save";
    toggle.setAttribute("aria-pressed", String(reformatted));

    verdictOut.innerHTML = reformatted
      ? "<strong>Sent back.</strong> A reviewer now has to find " + intended +
        " intended lines inside " + shown + ". Turn formatting off for this repo."
      : "<strong>Reviewable.</strong> Every changed line is a line you chose to change.";
  }

  if (clean && noisy && toggle && diffLabel && countOut && realOut && verdictOut) {
    var reformatted = false;

    toggle.addEventListener("click", function () {
      reformatted = !reformatted;
      renderDiff(reformatted);
    });

    renderDiff(reformatted);
  }
})();
