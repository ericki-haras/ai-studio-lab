/* ==========================================================================
   LAB REGISTRY
   --------------------------------------------------------------------------
   This is the only shared file you need to touch to publish your lab.
   Everything else lives inside your own folder, which is what keeps merge
   conflicts nearly impossible.

   TO ADD YOUR LAB: append one object to the end of the array below.
   Do not reformat, reorder, or "tidy" the existing entries — that turns a
   1-line diff into a 40-line diff and makes your PR slow to review.

   Fields
     slug     folder name under /labs — lowercase, hyphens, no spaces
     name     what appears in the menu and on the card
     owner    your name
     blurb    one sentence, max ~90 characters
     branch   graph colour: "cyan" | "magenta" | "amber" | "lilac"
     added    YYYY-MM-DD
   ========================================================================== */

window.LABS = [
  {
    slug: "haras",
    name: "Haras' Lab",
    owner: "Haras",
    blurb: "Reference lab. Copy this structure, then make it unrecognisable.",
    branch: "cyan",
    added: "2026-08-13"
  },
  {
    slug: "johnny",
    name: "Johnny's Lab",
    owner: "Johnny",
    blurb: "A fun designer who likes memes.",
    branch: "amber",
    added: "2026-08-19"
  },
  {
    slug: "pedro",
    name: "Pedro's Lab",
    owner: "Pedro",
    blurb: "Learning the branch, PR, and review loop by doing it.",
    branch: "lilac",
    added: "2026-08-19"
  }

  // ↓ your entry goes here. Copy the block above, keep the comma placement right.
  // ,{
  //   slug: "your-name",
  //   name: "Your Name's Lab",
  //   owner: "Your Name",
  //   blurb: "One sentence about what you're exploring.",
  //   branch: "magenta",
  //   added: "2026-09-01"
  // }
];
