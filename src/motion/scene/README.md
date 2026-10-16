# `motion/scene/` — the living scene

Design: `docs/superpowers/specs/2026-10-16-living-scene-design.md`.
Plan and as-built rulings: `docs/superpowers/plans/2026-10-16-living-scene.md`.

The homepage has a single canvas behind all of its content. It holds one
field of points, and the points take the shape of whichever section is in
the middle of the screen. As the page scrolls they travel from one shape to
the next. Nothing else on the homepage moves as a layer of its own.

## Files

| File | Job | Tests |
| --- | --- | --- |
| `scene.ts` | Runtime: tiers, canvas, shape queue, anchors, the one loop, input | e2e `tests/e2e/scene.spec.ts` |
| `timeline.ts` | Pure choreography: `computeAnchors`, `resolve`, `retarget`, `layoutFor` | `tests/unit/timeline.test.ts` |
| `points.ts` | Pure, seeded generators: `rng`, `scatter`, `fitCount`, `sampleMask` | `tests/unit/points.test.ts` |
| `shapes.ts` | Shapes from text, stroked marks, project plates (geometry) and the scan | `tests/unit/shapes.test.ts` |
| `glyphs.ts` | The Credo marks (Build / Teach / Move / Explore) and the contact arrow, approved by Denis | — |
| `scanData.ts` | Parser for the packed scan files (`scripts/build-scans.mjs`) | `tests/unit/scanData.test.ts` |
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

On screens of 62rem and wider you can also set `data-scene-x` (centre, in
clip space from -1 to 1) and `data-scene-scale`, so the shape sits in empty
space. Below 62rem every shape is centred and dimmed.

Shape ids:

- `name`, `credo` and `arrow`, built from the h1 and `glyphs.ts`;
- `work:<slug>`, sampled from the `svg[data-visual]` plate in that row
  (desktop only; phones show the cards' own plates and the field drifts);
- `scan`, from the `data-desktop` / `data-mobile` files on the element;
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

- **Off the load path.** The hero asks for the scene (`irl:scene`) on the
  visitor's first input (mouse move, touch, scroll or key). The depth
  runtime then imports the chunk. Without input nothing moves (WCAG 2.2.2).
  Lighthouse sees the homepage as it was before the scene (perf 96, TBT 0,
  LCP at baseline).
- **No long tasks.** Every shape builds in its own idle slice. Each plate
  is sampled at most 1 500 times. GL context creation and shader compile
  each get a slice of their own.
- **The loop stops.** It runs while points travel, scroll velocity decays,
  or the pointer moves. Otherwise it stops, and it stops on `pagehide` and
  in hidden tabs. `pageshow` from bfcache re-measures and restarts it.
- **Calm switches live.** Calm switched on mid-visit drops to the 2D painter
  and releases the GL context.
- **Contrast.** Shapes sit beside text, or behind it dimmed. The hero name
  stands at x 0.62 and scale 0.34. Closer in, it cut the statement's
  contrast below AA.
- **Budget** (`scripts/check-budget.mjs`): the scene chunk is ≤ 9 KB gz
  (6.4 at landing) and the fallback ≤ 1.5 KB.
