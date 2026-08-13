# AI Studio Lab

A working repo for the Design Engineering Guild. Every designer gets a folder, builds
whatever they want in it, and ships it to the live site through a pull request.

The work is yours. The workflow is the lesson.

**Live site:** `https://YOUR-ORG.github.io/ai-studio-lab/` *(update once deployed)*

---

## Run it locally

No build step, no dependencies, no `npm install`. It's plain HTML, CSS, and JavaScript.

```bash
git clone https://github.com/YOUR-ORG/ai-studio-lab.git
cd ai-studio-lab
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Use a local server rather than double-clicking `index.html` — opening the file directly
works for the home page but breaks navigation between labs.

---

## Structure

```
ai-studio-lab/
├── index.html              home page + the workflow instructions
├── assets/
│   ├── site.css            all styling — shared, don't edit in a lab PR
│   ├── nav.js              builds the Lab menu from the registry
│   └── site.js             scroll reveals, copy buttons
└── labs/
    ├── labs.js             THE REGISTRY — the one shared file you append to
    ├── _template/          copy this to start your lab
    └── haras/              reference lab
```

### How a lab gets published

Adding one entry to `labs/labs.js` puts your lab in **two** places at once — the `Lab`
dropdown in the top nav, and the card grid on the home page. Both are generated from
that array, so there's no second list to keep in sync.

### Why one folder per person

It's the whole reason this repo is a good place to learn. Merge conflicts happen when
two people change the same lines of the same file. If everyone stays inside their own
folder, that can't happen — so you get to practise branching, reviewing, and merging
without the frustration of resolving conflicts you didn't cause.

`labs/labs.js` is the one exception, and it's an append-only list precisely to keep
those diffs to a few lines.

---

## Deploying

Set up once, then every merge to `main` publishes automatically.

**GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / root.

Since there's no build step, any static host works — Netlify and Vercel will both take
this repo as-is with no configuration.

---

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)**, or the step-by-step walkthrough on the
[home page](index.html) of the site itself.
