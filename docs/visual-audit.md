# Visual audit — before iteration 2

Performed 2026-08-29 against the v0.1 build at 1440×1000 and 390×844.

## Method, and its limits

The browser pane renders and screenshots, but two things make it unreliable:

- **CSS transitions barely advance.** The pane composites only when a capture
  is requested, so screenshots taken during a reveal catch it mid-flight. QA
  therefore injects a freeze stylesheet (`transition-duration: 0s`) and forces
  `is-revealed` before capturing.
- **`position: sticky` layers composite at the wrong offset**, and captures
  after a programmatic scroll sometimes come back entirely black.

So: screenshots were used for **character** (does it look like anything?), and
`getBoundingClientRect` + `getComputedStyle` sweeps were used for **facts**
(sizes, weights, rhythm). Where the two disagree, the measurements win.

---

## Bug found — the name is rendered wrong

`.line { overflow: hidden }` masks the reveal, `.hero__name` runs at
`line-height: 0.86`, and `text-transform: uppercase` turns `ć` into `Ć`.

**The acute accent on Ć is clipped off.** The hero renders "MITROVIC".

The mask pads for descenders (`padding-block-end: 0.08em`) but nothing pads
for ascenders or diacritics. On a site whose headline is a person's name, in
six languages, three of which are full of diacritics, this is the single most
important thing on this page to fix.

## What works

- The dark, warm-neutral palette holds up. Off-white on near-black with one
  vermilion accent is confident and reads nothing like a SaaS template.
- Mono micro-labels give the "lab" register the brief asked for.
- The language gate is already the strongest screen: giant type on black,
  six options, no chrome.
- No horizontal overflow at 390 px. Touch targets clear 44 px.
- Selected Work's desktop pointer-preview / touch-inline split is sound and
  should be kept as-is structurally.

## What reads as generic

**1. There is no typographic hierarchy — measured, not guessed.**

| Element | Desktop | Mobile |
| --- | --- | --- |
| Hero name | 202 px / 650 | 61 px |
| Hero statement | **68 px** / 600 | **34 px** |
| Section `h2` | **68 px** / 600 | **34 px** |
| Project title | 64 px / 600 | 28 px |
| Contact title | 120 px / 650 | 47 px |

The positioning statement, every section heading and every project name land
within 4 px of each other, at the same weight. Nothing is louder than
anything else, so nothing feels like the point. Meanwhile **Contact (120 px)
shouts louder than Selected Work (64 px)** — the exact inverse of the brief,
which says Selected Work is the core of the homepage.

**2. One weight everywhere.** Everything display-sized is 600–650. A variable
font with a 100–900 axis is being used as if it had one weight. There is no
weight contrast anywhere, which is the cheapest and strongest typographic
identity move available.

**3. Colour is leaking.** `.project__category` renders in each project's own
hue — five different colours down one list. That is the "colour funfair" the
brief warns against. The per-project hue belongs inside the plate, not in
running text.

**4. Rhythm is metronomic.** Every section has identical padding
(130 px top, 130 px bottom). Even spacing everywhere means the page never
signals what matters. About is 506 px tall next to Work at 1744 px, so the
narrative feels skipped rather than deliberate.

**5. Composition is a stack.** Everything is a full-width, left-aligned block
in one 1313 px container. The hero's indent is the only asymmetry on the page.
There is no editorial grid and no sense of a designed page.

**6. Micro-typography is inconsistent.** Mono labels are all 13 px but use
three different letter-spacings (2.26 px, 1.76 px, normal).

## Whitespace

- **Gate:** a large, unstructured gap between the greeting and the chooser.
  The space is not wrong in size, it is wrong in *intent* — nothing structures
  it, so it reads as a layout accident rather than a pause.
- **Hero:** the right two-thirds of the screen is empty. For a "creative
  technologist" that is a wasted opportunity for technical micro-typography.
- **About:** too tight for the one section that is supposed to carry a story.

## Motion

- **Helps:** the greeting morph, the gate → locale transition, the project
  pointer preview. All three are doing real work.
- **Neutral:** scroll reveals. Correct, cheap, unremarkable.
- **Missing:** there is no motion *signature*. Everything currently fades or
  slides. Nothing draws, builds, or reveals in a way that would be recognised
  as belonging to this site — which is what motion reference 07
  (`stroke-dashoffset` line drawing) is for.
- **The transition is a wipe.** It works and it never traps the user, but a
  solid rectangle sliding over the screen is the generic version of this idea.

## Mobile specifics

- **The navigation eats 138 px of an 844 px viewport — 16% of the screen,
  permanently, because it is sticky.** Two rows plus two borders is too much
  chrome for a site this quiet.
- Hero is 692 px tall but sits under 138 px of nav, so the composition is
  squeezed into roughly 700 px and the hero name (61 px) has to share it with
  four more blocks.
- The same flat hierarchy as desktop: statement and section headings are both
  34 px.
- Work section is 2937 px — five cards with 197 px plates. Acceptable, but the
  cards need stronger internal hierarchy to be worth the scroll.

---

## Priorities for iteration 2

1. Fix the clipped diacritic. Correctness before art direction.
2. Rebuild the type scale around **roles**, not sizes, and introduce weight
   contrast. Section headings get quieter; project titles get louder.
3. Give the page an editorial grid and vary section rhythm.
4. Pull the per-project hue back into the plates.
5. Give the hero a real composition, including technical micro-typography
   derived from actual data rather than decoration.
6. Upgrade the two signature moments: a threshold-filter morph (ref 04) and a
   panelled transition, plus one `stroke-dashoffset` motif (ref 07).
7. Reduce mobile nav chrome.

---

## What iteration 2 actually changed

Re-measured at 1440×1000 and 390×844 after the work landed.

| Role | v0.1 desktop | v0.2 desktop |
| --- | --- | --- |
| Hero name | 202 px / 650 | 128 px / **640** |
| Hero statement | 68 px / 600 | 82 px / **300** |
| Project title | 64 px / 600 | 68 px / 600 |
| Contact title | 120 px / 650 | 53 px / **300** |
| Section `h2` | 68 px / 600 | **40 px** / 500 |

The scale now descends cleanly and carries a weight rule with it: names are
heavy, sentences are light. Contact no longer shouts louder than the work.

Also fixed or changed:

- **Ć renders.** Verified visually, not just in the DOM text.
- Per-project hue pulled out of running text; it survives only inside the
  plates and as a hover hairline.
- Section rhythm split into three weights (`--s-section-sm/-/-lg`).
- Twelve-column grid introduced; hero, section heads, project rows, about and
  the project pages all place against it.
- Mobile nav: 138 px → 121 px, and it folds to 48 px once the page is
  scrolled. 121 px is the honest floor for two rows of 44 px touch targets.
- Mobile hero name raised from 44 px to 52 px — the v0.1 value was the
  arithmetic minimum of the clamp rather than a decision.
- Missing `favicon.ico` 404 found in the Playwright console log and fixed.

Still open: the gap between the mobile scroll cue and the first section is
generous to the point of reading as a pause nobody asked for. Left alone for
now because it is a judgement call, not a defect.
