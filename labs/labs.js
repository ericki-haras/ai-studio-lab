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
    slug: "pedro",
    name: "Pedro's Lab",
    owner: "Pedro",
    blurb: "Learning the branch, PR, and review loop by doing it.",
    branch: "lilac",
    added: "2026-08-26"
  },
  {
    slug: "lu",
    name: "Lu's Lab",
    owner: "Lu",
    blurb: "A space to experiment and learn by building.",
    branch: "lilac",
    added: "2026-08-26"
  },
  {
    slug: "isinha",
    name: "Isinha's Lab",
    owner: "Isinha",
    blurb: "A lab still finding its shape — check back soon.",
    branch: "amber",
    added: "2026-08-26"
  },
  {
    slug: "alicenasci",
    name: "Alice Lab",
    owner: "Alice",
    blurb: "Exploring AI-assisted design workflows and interface ideas.",
    branch: "lilac",
    added: "2026-08-26"
  }
  ,{
    slug: "isa-masi",
    name: "Isa Masi's Lab",
    owner: "Isa Masi",
    blurb: "One sentence about what you're exploring.",
    branch: "magenta",
    added: "2026-08-26"
  }
  ,{
    slug: "vicolla",
    name: "O Melhor Lab",
    owner: "vicolla",
    blurb: "O lab da vicolla. Ainda em construção, mas já competindo pelo título.",
    branch: "magenta",
    added: "2026-08-26"
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
  ,{
    slug: "rafas-lab",
    name: "Rafaela's Lab",
    owner: "Rafaela",
    blurb: "A tarot draw — 78 cards, each with its own three-sentence fortune.",
    branch: "lilac",
    added: "2026-08-26"
  }
  ,{
    slug: "guilherme-ferreira",
    name: "Guilherme's Lab",
    owner: "Guilherme Ferreira",
    blurb: "Two small tools that make a pull request easier to review.",
    branch: "magenta",
    added: "2026-08-20"
  }
  ,{
    slug: "analuluiza",
    name: "Ana Luiza's Lab",
    owner: "Ana Luiza",
    blurb: "A two-week road trip through Portugal, by car — Lisbon to a wedding up north and back.",
    branch: "amber",
    added: "2026-08-27"
  }
];
