# `motion/depth/` — the depth layer

The site becomes spatial without becoming a different site. Almost all of it
is CSS in `styles/depth.css`, driven by native scroll timelines on the
compositor; this folder holds the small remainder that needs script, and the
contract every component signs when it opts in.

The plan this implements is `docs/motion-depth-plan.md` (§1 rules, §5.1–5.2
API). Everything below is a merge gate, not a suggestion.

## The one idea

**Identity is the design.** Every primitive rests at no transform. With the
layer absent (Firefox, iOS < 26, reduced motion, Calm, no JS) the page is
exactly the composition that was drawn, and it is never in a "from" state.
Depth is only ever added on top; nothing is hidden to stage an effect.

## Attribute API

Put the attribute on a **wrapper**, never on an element that already has an
owner (see the owner rule). Every selector in `depth.css` is wrapped in
`:where()`, so it has zero specificity: a component's scoped style always
wins, and opting out of any part is one line.

| Attribute | Effect | Range | Phone (< 48rem) |
| --- | --- | --- | --- |
| `data-depth="rise"` | stands up out of the page: `translate: 0 2rem` and an 8° lean back (origin top) → identity | `entry 0` → `entry 25vh`, both shifted by `--rise-offset` | `translate: 0 1.25rem`, no rotation |
| `data-depth="recede"` | tips back about its bottom edge and steps away: `scale .96`, `translate: 0 -3vh`, 6° | `exit 0%` → `exit 100%` | no rotation |
| `data-depth="drift"` | a plane at another depth: `translate` from `--drift × 3vh` to `--drift × -3vh` | `cover` | × `--depth-amp` (0.6) |
| `data-depth="approach"` | arrives from slightly behind: `translate: 0 3rem`, `scale .96` → identity | `entry 0` → `entry 25vh` | × 0.6 |
| `data-depth="window"` | a photo seen through its frame: `scale 1.08`, `translate: 0 -3%` → `0 3%` | the `--frame` timeline | same |
| `data-scrub="rule"` | a 1px hairline (`::before`, block-start edge) that draws itself open from the inline start | own `view-timeline: --rule`, `entry 0` → `entry 40vh` | same |
| `data-tilt` (+ `data-tilting`, set by JS) | `transform: perspective(var(--persp)) rotateX(…) rotateY(…)` from `--tilt-x/y` | pointer | none |
| `data-lift` inside a tilting stage | `translate: 0 0 calc(var(--lift) * var(--tilt-z))` | pointer | none (flat) |
| `.press` | `:active { scale: .985 }`, eased | touch | yes (coarse pointers only) |

### Knobs (custom properties)

| Property | Where | Default | Meaning |
| --- | --- | --- | --- |
| `--rise-offset` | on a rise element | `0px` | Staggers a set: `calc(var(--i) * 2vh)`. **Must carry a unit** (it is added to `25vh` inside `calc()`). |
| `--drift` | on a drift element | `-0.5` | Negative = farther (slower than the page), positive = nearer. `1` = 3vh each way. |
| `--depth-timeline` | any ancestor | `view()` | Binds rise / recede / drift / approach to a named timeline instead of the element's own. Needed whenever the element sits inside an `overflow: hidden` box, which is a scroll container and would capture `view()`. Example: `.project { view-timeline: --card; --depth-timeline: --card }`. It inherits; set it on the narrowest wrapper. |
| `--rule-color` | on a scrub element | `var(--c-line)` | The hairline's colour. Move it with `inset-block-start: auto; inset-block-end: 0` on `::before` in your scoped style. |
| `--tilt-max-x`, `--tilt-max-y` | on a stage | `4deg`, `6deg` | Per-stage limits. Never above 6° (§7). |
| `--lift` | on a stage or lift | `24px` | How far a lift floats at full engagement. |

### Tokens (`styles/tokens.css`)

`--persp: 1100px` (800px below 48rem) · `--depth-amp: 1` (0.6 below 48rem) ·
`--tilt-max-x: 4deg` · `--tilt-max-y: 6deg` · `--lift: 24px` ·
`--floor-max-rot: 50deg` (the hero floor, W3).

### The `window` primitive needs a named timeline

The image lives inside an `overflow: hidden` frame, and that frame is itself a
scroll container, so the image cannot use `view()`. The **figure** (outside
the frame) declares the timeline:

```html
<figure style="view-timeline: --frame">        <!-- or in scoped CSS -->
  <div class="frame" style="overflow: hidden">
    <img data-depth="window" …>
  </div>
  <figcaption>…</figcaption>
</figure>
```

A priority (LCP) image may use `window`; it never gets opacity. Tier 1 (the
depth-map shader, `motion/media/depthPhoto.ts`) is deferred to the photo
phase. Its hook is already here: it will mount on top of a `window` image,
read the same figure, and obey `prefersReducedMotion()` and
`onMotionPreferenceChange()` from `../utils/env` like everything else.

## The rules

### 1. The triple gate

Every animated rule is inside `@supports (animation-timeline: view())`, inside
`@media (prefers-reduced-motion: no-preference)`, behind
`:root:not([data-calm])`. Pointer primitives (tilt, lift, press) are not
gated on `@supports` — they are not scroll-driven — but are on the other two.
There is **no main-thread scroll-scrub fallback**: browsers without scroll
timelines get today's site. Each `animation` shorthand is followed by
`animation-timeline` and `animation-range`, because the shorthand resets both.

### 2. The reading band

Entry primitives finish by `entry 25vh`: the element's top is at 75% of the
viewport. Exit primitives start at `exit 0`: its top reaches the top of the
viewport. So anything whose top is between ~25% and 75% of the viewport is at
identity — flat, crisp, full contrast — and anchor jumps
(`scroll-margin-block-start: 6rem`) and find-in-page always land on identity.
Text never fades inside the band; no primitive animates opacity at all.

This holds for boxes shorter than the viewport. For a box taller than the
viewport, `exit 0` is when its *bottom* reaches the viewport bottom, so never
put `recede` on a tall reading surface — put it on a plate or a figure.

### 3. One owner per element per property

- `[data-reveal]` / `[data-reveal-lines]` own `transform` and `opacity`.
- `[data-magnetic]` owns `transform`; `[data-parallax]` (hero) owns inline `translate`.
- `[data-depth]` owns `translate`, `scale` and — for **rise** and **recede on
  desktop only** — `transform` (see below). Never put it on an element that
  also has `data-reveal`, `data-reveal-lines`, `data-magnetic`,
  `data-parallax` or `data-tilt`. Wrap instead.
- `[data-tilt]` owns `transform` on a stage that has no other owner.
- `[data-lift]` owns `translate` while its stage tilts.

**Why rise and recede write `transform`.** Individual transform properties are
applied *outside* `transform` (translate → rotate → scale → transform), so a
`perspective()` inside `transform` can never foreshorten a `rotate: x`. An
unforeshortened 8° lean is a 1% vertical squash — invisible. So the rotation
travels as `transform: perspective(var(--persp)) rotateX(…)`, which is exactly
how the plan applies perspective to tilt stages (§1.6). Phones never get it.

### 4. Forbidden ancestors

Never put `transform`, `perspective`, `filter`, `will-change`, `contain: paint`
or `backdrop-filter` (and therefore no `data-depth`, `data-tilt` or `.press`)
on `html`, `body`, `main`, `.wrap`, `.work__list`, `.project`,
`.project__link`, or any ancestor of `.project__plate` (fixed on desktop),
`.pt`, `.transition-cover` or `.cursor-field`. Any of these makes the element
the containing block for fixed descendants and breaks the cursor preview and
the transitions. `.press` is coarse-pointer only for exactly this reason: on a
desktop row it would transform the containing block of the fixed preview.

### 5. Flattening (3D)

- A tilting stage is `transform-style: preserve-3d` and must never carry
  `opacity`, `overflow`, `filter`, `mask` or `clip-path` — any of them
  flattens it. Put those on a wrapper outside the stage.
- A `[data-lift]` must be a direct child of the stage, or every element between
  them must keep the 3D context (same list).
- At rest a stage is `transform: none`, never `rotateX(0)`: the layer
  de-promotes and text is crisp again in Safari. The tilt module removes
  `data-tilting` once settled, which is what guarantees it.
- Depth elements must be boxes (`block`/`inline-block`); transforms do not
  apply to inline boxes.

### 6. Layer budget

At most **12** concurrently animated layers in any viewport. Entry primitives
use `animation-fill-mode: backwards` (they hold their from-state below the
fold, release at identity); recede uses `none`; drift and window use `both`
(they span the whole visible range, and `both` avoids a 1–2 px pop at the
viewport edge). Animate a wrapper around a group rather than every item
wherever a section has more than 6 items.

## JS runtime

All exports are stable; W2–W8 code against them.

### `../utils/env`

| Export | |
| --- | --- |
| `prefersReducedMotion()` | System setting **or** `html[data-calm]`. Every existing module obeys Calm through this with no wiring. |
| `systemPrefersReducedMotion()` | The OS setting alone (the toggles need the difference). |
| `onMotionPreferenceChange(h)` | `h(calm)` on a system change or `irl:motionchange`. Returns an unsubscribe. |
| `onReducedMotionChange(h)` | Unchanged: system setting only. |
| `supportsScrollTimeline()` | `CSS.supports('animation-timeline: view()')`. |
| `canAffordGL()` | WebGL2 exists, no Save-Data, `deviceMemory ≥ 4` when known, `hardwareConcurrency ≥ 4` when known. A pre-filter; the engine's `failIfMajorPerformanceCaveat` is the real test. |
| `idle(cb, timeout = 2000)` | `requestIdleCallback`, or (Safari) the task after the next painted frame; never later than `timeout`. Returns a cancel function. |
| `CALM_ATTRIBUTE`, `MOTION_CHANGE_EVENT`, `MOTION_STORAGE_KEY` | `'data-calm'`, `'irl:motionchange'` (on `document`, `detail: { calm }`), `'irl:motion'`. |

### `index.ts` — `initDepth(): () => void`

Waits for `irl:revealed` (with a 4 s safety net that never fires under a
raised cover), then `idle()`. Then it sets `html.depth-ready` (present only
while live depth runs and Calm is off) and dynamic-imports `tilt.ts` — only on
a fine pointer, only when not calm, only if the page has a `[data-tilt]`.
Calm switched on tears tilt down at once; off, it comes back. Also exports
`afterReveal(run)`.

### `tilt.ts` — `initTilt(): () => void`

One delegated `pointermove`, mouse only. The stage rect is read once when the
pointer enters, at rest (never mid-tilt, when the rotated box would lie), and
scroll is compensated arithmetically. Membership is decided against that rest
box, so a pointer near a receding edge cannot flicker in and out. An eased
`createLoop` writes, on the active stage only:

- `--tilt-x` −1 (left) … 1 (right) → `rotateY`
- `--tilt-y` −1 (top) … 1 (bottom) → `rotateX` (the stage leans away under the pointer)
- `--tilt-z` 0 … 1 engagement → the lift distance, so a lift never pops

`data-tilting` and `will-change: transform` exist only while a stage moves;
settled, everything is removed and the loop stops. Focus is ignored, and so is
anything inside `[data-loaded]` (an iframe never sits in a 3D context).

### No Calm toggle (since 2026-10-16)

The site's own Calm toggles (`motionPreference.ts`, `[data-motion-toggle]`)
were removed at Denis's request. Reduced motion is the operating system's
setting alone. `html[data-calm]` is no longer set by anything; the CSS and
`prefersReducedMotion()` still honour it, harmlessly.

### `DepthRuntime.astro` and `BaseLayout.astro`

The boot script reads the stored preference **before first paint** on every
page, the gate included (a returning calm visitor lands on the gate first):

```js
try{if(localStorage.getItem('irl:motion')==='calm')document.documentElement.setAttribute('data-calm','')}catch(e){}
```

`integrations/csp.mjs` re-hashes it automatically. `--motion-mult` and
`scroll-behavior` collapse under `html[data-calm]` exactly as under the system
setting. `DepthRuntime` (toggles + depth) is rendered only on site pages: the
gate and the 404 never run or download it.

## Day-1 spike — results

Measured on **desktop Chrome 155** (headless, real build, `localhost:4611`):

| Question | Result |
| --- | --- |
| Length-offset `animation-range` (`entry 25vh`, `calc(25vh + var(--rise-offset))`) | Pass: from-state below the fold, partial at 90%, identity at 74% and 50% |
| Named view timeline driving a pseudo-element (`--rule` → `::before`) | Pass: partial near the bottom, fully drawn by `entry 40vh` |
| Named timeline read through an `overflow: hidden` frame (`--frame`) | Pass |
| `animation-timeline: var(--depth-timeline, view())` | Pass |
| `rotate: x` individual property | Not used — cannot be foreshortened (rule 3 above). |
| Calm/OS reduce → computed `animation-name: none` on every `[data-depth]` | Pass |

**Still to run on real devices** (no device was available for W1; this is the
W8 real-device protocol): iOS 26 Safari and Chrome Android for the four rows
above, and per-scroll-frame main-thread cost in a performance trace. If iOS
fails length offsets, switch the entry primitives to percentage ranges
(percentages of the `entry` range, tuned per primitive).

## Compositor rules (measured 2026-10-16)

Scroll-driven animations only stay off the main thread if they are
compositable. Measured on /sk/laby/ at 375×812 with 4× CPU throttle, these
are the rules that decide it:

1. **One animation per property per element.** Two `opacity` (or two
   `transform`) animations on one element are incompatible and both run on
   the main thread. Put the second on a wrapper.
2. **Never `translate` / `rotate` / `scale` on an SVG element** — use
   `transform`. The individual properties on SVG are not composited.
3. **Never `visibility` or `fill-opacity` / `stroke-opacity` on a scroll
   timeline.** Express a switch as an `opacity` step (`step-end` /
   `step-start`), which composites.

Two Chrome keyframe quirks met on the way: keyframe blocks at the same
offset with different easings stay separate keyframes, and `to` in one
selector list together with a named range (`entry 40%`) gets the wrong value.
The build's CSS minifier passes keyframes with named-range selectors through
unminified (the `css-syntax-error` warnings in the build log are this, not a
broken rule).

## Calm across the back/forward cache

A page restored from the bfcache does not run the boot script, so
`motionPreference.ts` re-reads `irl:motion` on `pageshow` with `persisted`
(capture phase, before the scan's and the plate transition's own handlers)
and, if it differs, re-applies `html[data-calm]` and dispatches
`irl:motionchange`. The hint stays hidden after a restore. The page's single
`role="status"` region lives in SiteNav's header, outside `<details>`; the
other `[data-motion-hint]` copies are plain text, so a press is announced once.
Covered by tests/e2e/bfcache.spec.ts, which re-enables the cache Playwright
disables by default.

