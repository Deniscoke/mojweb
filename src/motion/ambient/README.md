# `motion/ambient/` — GL layers, held to a contract

The page texture is still a single static SVG grain plate painted by CSS
(`styles/global.css`, `body::after`): texture for zero frames per second.
This folder is for the few things that are worth a GPU, and the first of them
is not decoration but evidence: **Denis's own point-cloud scan**, drawn from
its captured vertices (plan: `docs/motion-depth-plan.md` §5.3).

| File | Loads | Budget (gz) | Job |
| --- | --- | --- | --- |
| `mount.ts` | with the page module | ≤ 1.3 KB | When a GL layer may run, the context pool, calm, pauses, page lifecycle |
| `pointScan.ts` + `gl.ts` | dynamic `import()`, only once everything below is true | ≤ 4.5 KB | The engine: one program, one buffer, one draw call |

Data comes from `src/data/scans.ts` and `public/assets/scans/`, both written
by `scripts/build-scans.mjs`. Nothing renders unless the scan entry has
`approvedByDenis: true`.

## Mounting a scan

```ts
import { mount } from '~/motion/ambient/mount';

const scan = mount(host, {
  src: { desktop: '/assets/scans/kasna-…-desktop.bin', mobile: '/assets/scans/kasna-…-mobile.bin' },
  mode: 'hero',                       // or 'poster'
  sweep: true,                        // the one-off arrival sweep
  masks: [...hero.querySelectorAll('[data-scan-mask]')], // ≤ 3, dimmed 80% behind
  inputs: { pointer: true, scroll: hero }, // optional built-in mappings
  anchor: someGridCell,               // optional: the box the object stands in
  onReady: () => (caption.hidden = false), // first frame is on screen
});

scan.setYaw(deg); scan.setPitch(deg); scan.setDolly(0.05);
scan.teardown();
```

`mount` returns its handle at once. Setter calls made before the engine
exists are kept and applied when it arrives. `pointScan.ts` exports a `mount`
with the same signature that runs immediately; only the harness uses it.

**Host.** Must be positioned (`position: absolute | relative`). The engine
appends one `<canvas aria-hidden="true">` at `inset: 0`, with
`pointer-events: none`, starting at opacity 0 and fading in over 900 ms after
its first drawn frame. CSS masks (the hero's column weighting) belong on the
host.

**Placement.** With `anchor`, the object is centred on the anchor's box, as
wide as it, standing on its bottom edge. Without it: hero = columns 7–11
(centre 71%, width 40%, ground at 62%); a host under 260 px tall is treated as
the mobile stage band (centred, ground at 62%); poster = centred.

**Inputs** (all off by default; they add to the setters):

- `pointer`: mouse only, eased. Hero: ±6° yaw, ±3° pitch across the viewport.
  Poster: ±15° / ±6° over the host, back to rest on leave.
- `scroll: true | Element`: one passive listener, attached only while that
  element intersects. Exit progress 0 → 1 maps to 0 → 24° yaw and ≤ 8% dolly
  with a fine pointer, or 0 → 30° and no dolly on touch. Applied directly,
  not eased, so the scan stays in step with the CSS floor.
- `drag`: poster on touch. Horizontal only, `touch-action: pan-y`, ±40°;
  ignores pointerdowns on `a` and `button`, so "Load scene" stays a button.

## What `mount.ts` enforces

1. **Start sequence.** `REVEAL_EVENT` → `load` → `idle(…, 2500)` →
   `whenVisible(host)` → `import('./pointScan')`. Nothing starts under the
   language cover, competes with the page's own bytes, or loads off screen.
2. **Gate.** `canAffordGL()` (WebGL2, no Save-Data, enough memory and cores),
   then `gl.ts` asks for a context with `failIfMajorPerformanceCaveat`, so
   SwiftShader and blocklisted GPUs get no canvas at all rather than a slow
   one. Lighthouse runs on SwiftShader, so it never sees the scan; real-GPU
   checks belong to W8.
3. **Context pool.** At most one live context on touch devices and two with a
   fine pointer. A holder that is off screen is asked to snapshot and release
   before a claim is refused. `claimContext(el, evict)` is exported for
   `depthPhoto` (photo phase).
4. **Calm** (`prefersReducedMotion()`, which honours `html[data-calm]`): one
   frame, copied to a 2D canvas in the same task, then `loseContext()`. The
   still is pinned to its pixel size and redrawn once if the host is resized.
   Calm switched on live freezes the current frame; switched off, the scan
   comes back to life (without a second sweep).
5. **Pauses.** A `MutationObserver` on `<html>` stops drawing while
   `[data-entering]` or `[data-plate-transition]` is set.
6. **Lifecycle.** `pagehide` tears down and releases; `pageshow` with
   `persisted` remounts.

## What the engine guarantees

- **No autonomous motion over 2 s.** The loop runs while an input is changing
  or during the single 1.8 s sweep, then stops. Idle costs zero rAF callbacks.
  `createLoop` also stops on `visibilitychange`.
- **No sync shader stalls.** With `KHR_parallel_shader_compile`,
  `COMPLETION_STATUS` is polled once per frame; without it (Safari),
  `LINK_STATUS` is read in the next idle task. The buffer upload runs in a
  task of its own.
- **Governor.** Measures only frames that drew, in consecutive runs. A steady
  ~33 ms cadence with low spread is a 30 Hz refresh cap (iOS Low Power Mode,
  30 Hz panels) and moves the bar from 22 ms to 40 ms instead of counting as
  slow. Median over 45 frames above the bar: draw the first half of the
  points (the file stores an even half first). Slow again: freeze to a still
  and release the context.
- **Context loss.** `webglcontextlost` is `preventDefault()`ed and hides the
  canvas; `webglcontextrestored` recompiles and re-uploads from the kept file
  body (no second request).
- **Contrast.** Per-point alpha ≤ 0.22 (≤ 0.2 on touch), Gaussian falloff,
  depth fog, and up to three mask rects behind text at 20%.
- **Teardown** aborts the fetch, removes every listener and observer, calls
  `loseContext()`, and removes the canvas. `liveContexts()` in `gl.ts` counts
  what is still held.
- **CSP.** Shaders are string literals; no `eval`, `new Function`, `blob:`,
  workers or CDN. The `.bin` is fetched from `'self'` with
  `priority: 'low'`; the desktop file is never requested without a fine
  pointer.

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

The GPU reads both arrays straight from that layout (normalised `SHORT` and
`UNSIGNED_BYTE` attributes); there is no parse step. Budgets are raw bytes:
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

## The harness

`tools/scan-harness/` is a standalone Vite page that never ships:

```sh
npx vite --config tools/scan-harness/vite.config.ts   # http://localhost:4612
```

It drives the real engine and files: scheduled or direct mount; hero, stage
band and poster; still (calm); yaw/pitch/dolly sliders; continuous spin; a
simulated 30 Hz cap and jittery slowness; context loss and restore; a live
`data-calm` toggle; teardown. It also shows a live-context and rAF counter
with frame times. `?bare` hides the panel, `?target=`, `?via=` and `?still`
preset it, and `window.harness` exposes the same controls to Playwright.

## Deferred, with hooks in place

- **Tier 1 depth photos** (`media/depthPhoto.ts`, `scripts/build-depth-maps.py`)
  wait for Denis's photos. They will claim a context through
  `claimContext()` and reuse `gl.ts` (`createGL`, `program`, `snapshotTo2D`,
  `destroy`) unchanged.
- **The Splatoo poster scan** needs an approved `poster:splatoo` entry in
  `scans.ts`. Poster mode, hover orbit and touch drag are already in the
  engine.
