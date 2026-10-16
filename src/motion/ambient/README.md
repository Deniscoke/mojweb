# `motion/ambient/` — the GL wrapper

`gl.ts` is the smallest wrapper that keeps one WebGL2 context honest:

- a context that refuses to exist on software or blocklisted GPUs
  (`failIfMajorPerformanceCaveat`);
- shader linking that never stalls the main thread on a status query;
- `snapshotTo2D()`, to leave a still image behind;
- a `destroy()` that really gives the context back.

`liveContexts()` counts what is still held; the e2e harness reads it.

Its one user is the living scene (`src/motion/scene/`, see its README). The
hero scan engine that used to live here (`mount.ts`, `pointScan.ts`, the
`tools/scan-harness/` page) was removed on 2026-10-16, when Denis's scan
moved into the scene's Lab shape; it is in git at `b6f1fa8` if a poster
viewer is ever wanted again.

The page texture on every other page is still the static SVG grain plate
in `styles/global.css` (`body::after`). The homepage turns it off: the
scene draws its grain in its own fragment shader.

## Scan files

`public/assets/scans/<id>-<hash>-{desktop,mobile}.bin`, little-endian:

| Offset | Type | Field |
| --- | --- | --- |
| 0 | `char[4]` | `DMS1` |
| 4 | `uint32` | point count |
| 8 | `float32×3` | bounds min (m, Y up, centred on x/z, base at y = 0) |
| 20 | `float32×3` | bounds max |
| 32 | `uint32` | flags: bit 0 = first ⌈n/2⌉ points are an even subsample; bit 1 = luminance measured |
| 36 | `int16×3×n` | positions, normalised to the bounds |
| … | `uint8×n` | luminance |

`src/motion/scene/scanData.ts` reads it (unit-tested in
`tests/unit/scanData.test.ts`). Budgets are raw bytes:
desktop ≤ 70 000, mobile ≤ 28 000.

To rebuild (Denis's machine; the 148 MB source is never committed):

```sh
node scripts/build-scans.mjs                      # kasna.ply → files + scans.ts block
node scripts/build-scans.mjs --preview scan.png   # also a quick orthographic check image
```

Every shipped point is one of the capture's own vertices, picked one per
voxel by a fixed hash. Nothing is averaged or generated. A source whose PLY
header does not say RealityScan needs `--own-capture`, which is Denis
confirming he captured it. `Michel Rodange monument.ply` in the same folder
is an **Artec Group export under CC-BY 3.0**, not his capture, so it is not
evidence under rule 1.
