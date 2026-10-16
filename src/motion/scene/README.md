# `motion/scene/` — the living scene

Design: `docs/superpowers/specs/2026-10-16-living-scene-design.md`.
Plan and as-built rulings: `docs/superpowers/plans/2026-10-16-living-scene.md`,
extended to every page by `docs/superpowers/plans/2026-10-16-kinetic-site.md`.

Every site page has a single canvas behind all of its content. It holds one
field of points, and the points take the shape of whichever section is in
the middle of the screen. As the page scrolls they travel from one shape to
the next. The kinetic type (`src/motion/kinetic/`) is the scene's partner;
nothing else moves as a layer of its own.

## Files

| File | Job | Tests |
| --- | --- | --- |
| `scene.ts` | Runtime: tiers, canvas, shape queue, anchors, the one loop, input | e2e `tests/e2e/scene.spec.ts` |
| `timeline.ts` | Pure choreography: `computeAnchors`, `resolve`, `retarget`, `layoutFor` | `tests/unit/timeline.test.ts` |
| `points.ts` | Pure, seeded generators: `rng`, `scatter`, `fitCount`, `sampleMask`, `sampleWeighted` | `tests/unit/points.test.ts` |
| `shapes.ts` | Shapes from text, stroked marks, project plates (geometry) and the portrait map | `tests/unit/shapes.test.ts` |
| `glyphs.ts` | The Credo marks (Build / Teach / Move / Explore), approved by Denis | — |
| `morph.ts` | WebGL2 painter: `aFrom`/`aTo` mixed in the vertex shader, one draw call, grain in the fragment shader | GPU e2e |
| `fallback.ts` | 2D painter with the same `Painter` contract (weak devices, calm, context loss) | e2e |

Run the unit tests with `npm run test:unit` (Node's own runner; the pure
modules import nothing but each other, with explicit `.ts` extensions).

## Adding a section

Put `data-scene="<shape id>"` on the section, plus `data-scene-side`:

| Side | Use it for |
| --- | --- |
| `left`, `right` | a shape beside the text |
| `center` | a shape centred on the screen, behind the text and dimmed |
| `full` | the drifting field across the whole screen |

On screens of 62rem and wider you can also set `data-scene-x` and
`data-scene-y` (centre, in clip space from -1 to 1, y up) and
`data-scene-scale`, so the shape sits in empty space. Below 62rem every
shape is centred and dimmed, and only the scale is kept (as a cap). `data-scene-dot` sets
the point size for that shape at any width (the portrait uses 0.62: finer
points draw a face).

While a project's plate is the shape, the canvas carries `data-scene-rect`
(`left,top,width,height` in px): where the plate stands on screen. The plate
transition (`projects/plateTransition.ts`) grows the project page out of
exactly that rectangle.

Shape ids:

- `portrait`, Denis's face, from the density map on the element's
  `data-portrait` (`scripts/build-portrait.mjs` builds it from his photo,
  which stays outside the repository). Without the map the points spell the
  h1 instead;
- `credo` and `question`, built from `glyphs.ts`;
- `work:<slug>`, sampled from the `svg[data-visual]` plate in that element,
  or in `document.querySelector(data-scene-source)` (the case study's head
  draws the plate shown below it). Desktop only; phones, and projects
  without a plate, drift;
- `drift`, the field across the whole screen;
- `scatter`, the arrival state.

An unknown id falls back to `scatter`. When consecutive sections share an id,
they are one long hold.

## Tiers

| Tier | When | Points | Painter |
| --- | --- | --- | --- |
| `desktop` | WebGL2, fine pointer | 16 000 | morph; the pointer pushes points aside |
| `mobile` | WebGL2, touch | 4 000, DPR ≤ 1.5 | morph |
| `static` | calm, reduced motion, `!canAffordGL()`, or a lost/refused context | 4 000 | 2D: one frame per change of section |

The tier is set on `<html data-scene-tier>`. The shape on screen is set on
`canvas.scene[data-scene-state]`, and the e2e tests read both.

## Rules it keeps

- **Off the load path.** The depth runtime imports the chunk on the
  visitor's first input after the reveal (mouse move, touch, scroll or key),
  on any page with `[data-scene]`. The scene injects its own canvas style
  and switches the grain off, so no page carries those bytes in its HTML. Without input nothing moves (WCAG 2.2.2).
  Lighthouse sees the homepage as it was before the scene (perf 96, TBT 0,
  LCP at baseline).
- **No long tasks.** Every shape builds in its own idle slice. Each plate
  is sampled at most 1 500 times. GL context creation and shader compile
  each get a slice of their own.
- **The loop stops.** It runs while points travel, scroll velocity decays,
  or the pointer moves. Otherwise it stops, and it stops on `pagehide` and
  in hidden tabs. `pageshow` from bfcache re-measures and restarts it.
- **Reduced motion switches live.** The system setting switched on mid-visit drops to the 2D painter
  and releases the GL context.
- **Contrast.** Shapes sit beside text, or behind it dimmed. The hero
  portrait stands at x 0.66 and scale 0.44, above the readout. A shape
  closer in cut the statement's contrast below AA.
- **Budget** (`scripts/check-budget.mjs`): the scene chunk is ≤ 9 KB gz
  (7.0 at landing) and the fallback ≤ 1.5 KB.
- **Ink.** Points take `--scene-ink` from the first `[data-scene]` element
  (a lab's page sets its own colour), else the body's text colour.
- **Embeds.** A loaded embed (`irl:embed`, Splatoo's 3D viewer) keeps the
  GPU: the scene steps down to 2D.
- **Resilience.** The loop restarts when the tab becomes visible again,
  anchors are re-measured on window resize (a phone's URL bar), and a
  refused or failed WebGL setup warns once in the console and draws in 2D.
