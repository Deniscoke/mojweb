# `motion/kinetic/` — kinetic type

Design: `docs/superpowers/specs/2026-10-16-kinetic-site-design.md`.
Plan and as-built rulings: `docs/superpowers/plans/2026-10-16-kinetic-site.md`.

Type that moves the way the living scene's points do. It is on every site
page.

| Effect | What it does | Targets (selectors in `kinetic.ts`) |
| --- | --- | --- |
| gather | A heading coming into view splits into letters. They start scattered (±40 px, ±12°, unseen) and fly into the word. | `main h2` (not mono), `.project__title`, `.project-page__next-title` |
| decode | A mono label or number resolves out of scrambled glyphs, like a readout. | indices, numbers, tags, readout values, mono section labels |
| hover | Nav links decode again under the pointer or focus. | `.nav__link`, `.footer__top` |

## How it runs

- **Loading.** `src/motion/depth/index.ts` imports `kinetic.ts` in an idle
  moment after the visitor's first input, together with the scene. It is
  never loaded under the system's reduced motion, and never on the load
  path.
- **GSAP** (`gsap@3.15.0`, bundled locally because CSP allows `'self'`
  only). SplitText splits the text, with `aria: 'auto'`, so screen readers
  read words. ScrambleText runs the decode.
- **The flight.** It is Web Animations (transform and opacity, on the
  compositor), not a GSAP tween. A tween started in the scroll callback
  read styles back and recalculated the whole page.
- **Splitting** runs in idle slices, one heading per slice, prepared 60 %
  of a screen ahead.
- **One gather at a time** (`pick.ts`). A heading that arrives while
  another is gathering, or before it was prepared, is simply shown.
- **What was already on screen when the layer loaded is never hidden or
  replayed** (`seen()` in `pick.ts`).
- **Clean finish.** Every split is reverted to the original DOM when it
  lands, and every scramble ends on the original text.
- **Opt out:** `data-kinetic="off"` on an element or an ancestor.

## Costs

- The chunk is 34.7 KB gz (cap 40, `scripts/check-budget.mjs`).
- Evaluating GSAP is one task of about 25 ms (about 150 ms at 6× CPU). It
  runs once, idle-scheduled after the first input. It is the one exception
  in the GPU long-task test (`tests/e2e/gpu.spec.ts`). Everything the layer
  does afterwards stays under 50 ms at 6×.

Tests: `tests/unit/kinetic.test.ts`, `tests/e2e/kinetic.spec.ts`.
