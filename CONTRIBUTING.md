# Contributing

The point of this repo is practice. Your lab can be as strange as you like — the part
we're assessing is whether the change is easy to review and safe to merge.

The walkthrough on the [home page](index.html) has the same steps with copy-paste
commands. This file is the canonical version, and the one reviewers hold you to.

---

## Quick reference

```bash
git switch main && git pull              # start from current main
git switch -c lab/your-name              # branch
cp -r labs/_template labs/your-name      # claim your folder
python3 -m http.server 8000              # preview at localhost:8000
# ...build...
git add labs/your-name
git commit -m "Add lab page for Your Name"
git add labs/labs.js
git commit -m "Register your-name in lab index"
git push -u origin lab/your-name         # then open the PR from the printed link
```

---

## Conventions

These are enforced in review. None of them are about taste.

### Branch names
`lab/your-name` for a new or updated lab. `fix/short-description` for anything touching
shared files. The prefix tells a reviewer what kind of change is coming before they
open it.

### Scope
**Everything inside `labs/your-name/`, plus one entry in `labs/labs.js`.** That's the
whole footprint of a lab PR.

Do not, in the same PR:

- edit `assets/site.css`, `assets/*.js`, or the root `index.html`
- edit `labs/_template/`
- touch another person's lab folder
- reformat, re-indent, or reorder existing code
- fix an unrelated thing you noticed on the way past

Shared-file changes are welcome — as their own PR, on a `fix/` branch, with a sentence
on why. Bundling one into a lab PR means a reviewer has to evaluate two unrelated
things at once, which is how PRs sit unreviewed for a week.

> **If your editor formats on save, turn it off for this repo.** It is the single most
> common cause of unreviewable diffs here. A 7-line change that arrives as 200 changed
> lines will be sent back.

### Commits
Small and scoped. Read `git diff` before every commit — if you can't summarise the
change in one line, it should probably be two commits.

Write messages in the imperative, describing the change:

- Good: `Add lab page for Ana`, `Fix broken image path in ana lab`
- Not useful: `updates`, `wip`, `changes`, `fix stuff`

### Registry entries
Append to the end of the array in `labs/labs.js`. Don't reorder or reformat what's
already there. `slug` must exactly match your folder name.

### Assets
Images and fonts go in your own folder. Compress images before committing — nothing
over ~500 KB. No absolute paths (`/Users/you/Desktop/...` will work on your machine
and nowhere else).

---

## Opening the pull request

Title it the way you'd title a commit: `Add lab page for Ana`.

In the description, cover three things:

1. **What you built** — a couple of sentences.
2. **A screenshot.** Reviewers shouldn't have to check out your branch to see a design.
3. **What you want feedback on**, if anything specific.

Then **review your own diff first**, in the *Files changed* tab, before requesting
anyone. You will find something. Everyone does. This one habit does more for how
engineering experiences our team than anything else on this page.

---

## What reviewers check

Not whether the design is good — that's a critique, and we hold those separately. A
review asks whether the change is safe and easy to accept.

- [ ] Scope is your folder plus one registry line
- [ ] No unrelated or reformatted changes
- [ ] Commit messages describe the change
- [ ] Works from a fresh clone — no broken paths
- [ ] Description explains what it is and includes a screenshot
- [ ] **You can explain every line**

That last one is the one that matters. If a reviewer asks why something is there,
"the agent added it" is not an answer — it's a signal that the line should come out.
Use whatever tools you want to build; own the diff you submit.

---

## Receiving review

Expect a round or two of comments. That's the system working, not a rejection.

Some vocabulary you'll see:

| Comment | Means |
|---|---|
| `nit:` | Minor, optional. Fix it or say you'd rather not. |
| `blocking:` | Must be resolved before merge. |
| `LGTM` | Looks good to me — approved. |
| `Can you explain X?` | A real question, not an accusation. Answer it. |

Push a new commit to the same branch to address feedback; the PR updates itself.
"Good catch, fixed" is a complete and professional reply. Nobody wants an apology.

---

## When something breaks

- **`git status` first.** It tells you where you are and what's changed, and it's the
  answer to most "what do I do now" moments.
- **Nothing is lost.** Committed work can always be recovered.
- **Don't force-push** to a shared branch.
- **Stuck for more than 15 minutes?** Bring it to the PR clinic or the channel. Getting
  unstuck in public is more useful to everyone than getting unstuck alone.
