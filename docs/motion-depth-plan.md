# Motion depth plan — "Ground Plane, with one real scan"

**Branch:** `feat/motion-depth` · **Status:** approved plan, ready to build · **Date:** 2026-10-15

Denis asked for the site to feel more dynamic and more three-dimensional on
phone and desktop, so that scrolling through it is an experience. The work
builds on the existing design and does not replace it, and it leaves designed
places for the photographs he is choosing now.

This plan is the merge of three competing proposals after three judging lenses
(performance, experience, robustness):

- **Backbone: "Ground Plane"** (depth-editorial). Most depth is compositor CSS
  driven by native scroll timelines. The site's own grid, plates and ink
  surfaces become spatial.
- **Grafted: "Quiet Depth"** (hybrid-moments). WebGL is allowed only where the
  3D object is *real evidence*: a point cloud Denis captured himself. Calm mode
  goes through `prefersReducedMotion()`. Photos get tiers.
- **Grafted: "POINTFIELD"** (pointcloud). The best engineering hygiene:
  `failIfMajorPerformanceCaveat`, a governor that knows about 30 Hz caps, loops
  that stop when idle, mask rects behind text, and snapshot-then-`loseContext`.
- **Rejected from POINTFIELD:** the persistent full-page fixed canvas
  (scroll-sync swim, thermal cost, continuous optic flow), procedural "scans",
  hiding photographs while they "assemble", the gyro Tilt chip, translucent
  Credo/Lab surfaces, and any motion on `/lab` notes.
- **Rejected from Ground Plane:** the *fixed* homepage floor that travels the
  whole page (vestibular risk and a z-index bug). The floor now lives inside
  the hero only. Also rejected: Credo extrusion copies, ghost numerals,
  -75° index-card flips, kinetic `rotateX` on `.line__inner`, and the
  main-thread scroll-timeline fallback for Firefox and iOS < 26.

### As built (2026-10-16) — where the site now differs from this plan

The sections below are the plan as approved. These changes came out of
integration and the final four-lens review; the code and its comments are
the source of truth.

- **Hero, desktop:** a lit floor (`.hero__floor`, the twelve rules in bone at
  16%, solid at the hinge, a ground rule and two cross rules) takes over from
  the standing rules by 35% of the range instead of the rules dimming as they
  lie down. The scan anchor lives in the hero's own grid (columns 7–11, the
  rows of the name block) so its footprint clears the readout at every
  window height; the kasna scan is cut to the pavilion and its plinth (radius
  5.9 m), point alpha 0.40 / 0.44 (touch / fine), and the turntable turns
  120° (desktop) / 90° (touch) over the hero's exit.
- **Hero, phone (§2 "The stage"):** the rules no longer lie down or squash
  into the stage. They end above the scroll cue, and the stage has a static
  perspective ground (`.hero__ground`, inline SVG) with an oval clearing where
  the object stands. Nothing rotates below 62rem.
- **Selected Work, desktop ≥ 80rem:** "the band" — before the hand moves, the
  row crossing the middle of the screen presents its own plate in the empty
  right side of the row: it arrives turned 8°, its accent sheet lifted, and
  settles. A still pointer under scrolling rows does not summon the cursor
  preview; the first real move does and picks the plate up from the band.
  Below 80rem the rows have no empty right side and keep the list.
- **Dioramas:** every switch is a compositable `opacity` step; no
  `visibility` or `fill-opacity` on a scroll timeline (see the compositor
  rules in src/motion/depth/README.md).
- **Lab (§3.6, §3.14):** not a full-width line but a short index mark (1px
  rule + 7px riser) that moves through the gutter between `.lab__num` and
  `.lab__title`, translate only, on the same timelines.
- **Case study:** no next-project ghost plate (a 17 KB SVG per page for a
  faint decoration); the next title still approaches.
- **depth.css:** inlined on the homepage, linked (preloaded, applied at the
  end of `<body>`) everywhere else — docs/motion-depth-qa.md note 2.
- **Calm:** re-read on a back/forward-cache restore; the page's one
  `role=status` region sits in the header, outside the language menu.

### A finding that changes the plan

Real scans already exist on Denis's machine:

- `C:/Users/Admin/Desktop/reality scan/kasna.ply` is a RealityScan export,
  148 MB, with 2.6 M captured points. It is **already published as evidence**:
  it is `digital-space-pointcloud.webp` in `src/data/evidence.ts`, credited
  "Captured and reconstructed in RealityScan", and `scripts/render-pointcloud.py`
  renders from it.
- `C:/Users/Admin/Desktop/reality scan/Michel Rodange monument.ply` is a second
  real capture, 114 MB.

The hero's 3D moment therefore does not depend on a Splatoo export that does not
exist yet. It ships from real captured vertices that Denis has already published,
with provenance on record. A Splatoo Žďár export stays optional and only powers
the Splatoo poster (W7).

---

## 1. Rules every work item follows

These are the merge gates, not suggestions.

1. **Evidence, not spectacle.** Every 3D object is real: Denis's own scan, his
   project plates, his photographs. If no real source exists, nothing renders.
   There is never a procedural "fake scan" and no placeholder grey boxes.
2. **Input-driven only.** Nothing moves on its own for longer than the one-off
   ~2 s scan arrival sweep. Every other motion is tied to scroll position or to
   the pointer, and it stops when input stops. This meets WCAG 2.2.2 by
   construction.
3. **Native scrolling, always.** No scroll-jacking, pinning, smooth-scroll
   library, wheel or touch interception, or `preventDefault` on scroll. The only
   scroll listeners are passive, and they run only while their element is
   visible.
4. **The reading band.** Animation ranges use length offsets. Entry primitives
   finish by `entry 25vh`, which puts the element's top at 75% of the viewport.
   Exit primitives start at `exit 0`, when the element's top reaches the top of
   the viewport. So any element whose top is between about 25% and 75% of the
   viewport is at *identity*, meaning flat, crisp and full contrast. Anchor
   jumps (`scroll-margin-block-start: 6rem`) and find-in-page always land on
   identity. Text never fades below opacity 1 inside the band.
5. **One owner per element per property.**
   - `[data-reveal]` owns `transform` and `opacity` on its element.
   - Scroll depth (`[data-depth]`) uses only the individual `translate`, `scale`
     and `rotate` properties, and *never* goes on an element that also has
     `[data-reveal]`, `[data-reveal-lines]`, `[data-magnetic]` or
     `[data-parallax]`. Put it on a child or wrapper instead.
   - `pointerField` (hero) owns inline `translate` on `[data-parallax]`.
   - Tilt (`[data-tilt]`) owns `transform` on an inner stage that has no other
     owner.
   - `check-budget.mjs` (W8) greps the built HTML for violations.
6. **Forbidden ancestors.** Never put `transform`, `perspective`, `filter`,
   `will-change`, `contain: paint` or `backdrop-filter` on `html`, `body`,
   `main`, `.wrap`, `.work__list`, `.project`, `.project__link`, or any ancestor
   of `.project__plate` (fixed on desktop), `.pt`, `.transition-cover` or
   `.cursor-field`. Any of these makes the ancestor the containing block for
   fixed descendants, which breaks the cursor preview and the transitions.
   Perspective is applied as `transform: perspective(…)` *on the stage itself*.
7. **3D flattening rules.** A `preserve-3d` stage never carries `opacity`,
   `overflow`, `filter`, `mask` or `clip-path`. At rest a stage is
   `transform: none`, not `rotateX(0)`, so its layer de-promotes and text stays
   crisp in Safari.
8. **Mobile is its own design.** Below 48rem:
   - no rotations, only `translate` and `scale`
   - `--depth-amp: 0.6`
   - no pointer effects and no DeviceOrientation
   - one live WebGL context at most
   - `:active` press depth instead of hover
9. **Progressive, not polyfilled.** Browsers without
   `animation-timeline: view()` (Firefox today, iOS < 26) get today's site
   unchanged. JS-driven pieces still run there (pointer tilt, the scan, depth
   photos). No main-thread scroll-scrub fallback ships.
10. **Layer budget.** At most 12 concurrently animated layers in any viewport.
    Entry primitives use `animation-fill-mode: backwards`; exit primitives use
    `none`. Animate wrappers around groups, not every list item, wherever a
    section has more than 6 items.

---

## 2. The two signatures

**Desktop: "The grid lies down, and the scan stands on it."**

On load the hero shows today's 12 faint column rules standing behind
DENIS / MITROVIĆ. Nothing moves until the visitor scrolls, so LCP is
untouched. As the hero scrolls out:

- the rules rotate back about their bottom edge into a perspective floor;
- the first name drifts back on a farther plane;
- Denis's real point-cloud scan, which faded in once on arrival with a single
  scan-plane sweep, stands on that floor in the empty right side of the grid
  and turns slowly with the scroll, like a turntable you drive with your thumb.

The pointer looks around it by a few degrees. A mono caption,
`SCAN · <PLACE> · <YEAR> · REALITYSCAN · 2.6M POINTS →`, is a real link to the
lab note it came from. Further down, the cursor-carried project plate leans
with the hand's momentum, and its accent shapes lift off the plate, so each
generated plate reads as a small layered object.

**Phone: "The stage."**

The mobile hero gains a fixed-height *stage* band (`aria-hidden`, about 11rem)
under the readout. It is designed to look intentional even when empty. As you
scroll, the four mobile column rules lie down into a floor inside it, and the
same real scan (4k points) stands on that floor and turns with your thumb. In
Selected Work each card plate becomes a diorama as it crosses the screen: the
artwork drifts inside its frame, and the accent layer separates visibly
(±12 px) from the base layer.

---

## 3. Section by section

Homepage order: Hero → SchoolsEntry → Credo → SelectedWork → WhatIDo →
LabPreview → About → Currently → Contact → Footer.

"Calm" below means `prefers-reduced-motion: reduce` **or** `html[data-calm]`
(the new toggle). Both give the same result.

### 3.1 Hero — `src/components/hero/Hero.astro` (W3)

**Desktop (≥62rem)**

- **Floor.** `.hero__rules` animates on a `scroll(root)` timeline over the range
  `8vh 70vh`, from `transform: perspective(var(--persp)) rotateX(0)` to
  `rotateX(var(--floor-max-rot))`. The token defaults to **50deg** (not 68),
  with `transform-origin: bottom`, and opacity goes from 0.55 to 0.3. The rules
  stay `position: absolute` inside the hero and scroll away with it. **There is
  no fixed floor.** It is identity at scroll 0.
- **Name planes.** `.hero__name .line:first-child` gets `translate: 0 -5vh` and
  `scale: 0.97`. `.line:last-child` gets `translate: 0 -1.5vh`. Range is
  `scroll(root) 8vh 60vh`. These go on `.line`, never on `.line__inner`, which
  owns the reveal. The statement holds its plane.
- **No kinetic `rotateX` on `.line__inner`.** `.line` has `overflow: hidden`,
  which flattens 3D, and it is the LCP h1.
- **Pointer field.** `src/motion/hero/pointerField.ts` changes one line. It
  writes `el.style.translate = 'Xpx Ypx'` on each `[data-parallax]` layer
  instead of `el.style.transform`, so pointer parallax composes with the reveal's
  `transform` transition. It does **not** write inherited custom properties on
  `.hero`, which would invalidate style for the whole subtree. Teardown clears
  `translate`. `.hero__disciplines` and `.hero__aside` get no scroll animation
  (owner rule).
- **The scan** (`src/motion/hero/heroScan.ts` and W2's engine):
  - A host `<div class="hero__scan" aria-hidden="true">` sits absolutely inside
    `.hero` (`inset: 0`, `z-index: 0`). `.hero__inner` gets `z-index: 1`; it is
    already `position: relative`.
  - A CSS mask weights the canvas to columns 6–12: a linear gradient to the
    right, transparent until 42%, solid from 62%.
  - The object stands in columns 7–11, base at about 62% of hero height, so it
    reads as standing on the laid-down floor.
  - Points are `--c-bone` at alpha ≤ 0.22 with a Gaussian falloff and depth fog.
  - **Mask rects.** The shader dims points by 80% inside up to 3 rects measured
    from `[data-scan-mask]`, which is set on `.hero__statement`, `.hero__aside`
    and `.hero__cue`. Rects are hero-relative and the canvas scrolls with the
    hero, so masks can never swim during flings.
  - **Arrival.** After `REVEAL_EVENT`, then `load`, then idle (2.5 s timeout),
    then visible, the canvas fades in over 900 ms while one bone-coloured scan
    plane sweeps bottom to top once over 1.8 s. It does not use signal orange,
    which is reserved for live status, links and focus. Total autonomous time is
    under 3 s.
  - **Pointer** (mouse only): eased yaw ±6° and pitch ±3°, same sign as the
    `[data-parallax]` layers. The loop stops when settled.
  - **Scroll.** One passive listener, attached only while the hero intersects,
    maps hero exit progress (0 to 1) to a turntable yaw of 0° to +24° and a
    dolly of at most 8%. The loop runs only while `scrollY` changes and stops
    after 2 unchanged frames.
  - **Caption.** `<a class="mono hero__scan-cap" hidden>` sits in the bottom-right
    grid cell and links to `/<lang>/lab/digital-space/` (or whichever source
    `scans.ts` names). `heroScan` removes `hidden` after the first drawn frame.
    The caption describes a JS-only visual, so a no-JS visitor loses nothing.
  - **Rendering.** If `scans.ts` has no hero entry, or the `.bin` is missing at
    build time (`existsSync`), neither the host nor the caption is rendered.

**Mobile (<62rem)**

- **The stage.** A new `<div class="hero__stage" aria-hidden="true">` is
  rendered always: `block-size: 11rem`, after `.hero__cue`, in normal flow. It
  is a static part of the layout from first paint, so CLS is 0. The scan host
  is placed inside it rather than over the hero text.
- **Floor.** The rules are now shown on mobile with 4 spans (hide
  `:nth-child(n+5)`; `.grid12` is 4 columns below 48rem). They lay down at full
  strength over the range `scroll(root) 4vh 50vh` and settle into the stage.
  Empty, the stage reads as a floor of four hairlines.
- **Scan.** 4k points, `renderScale` cap 1.25, alpha ≤ 0.2. Scroll drives the
  turntable yaw (0° to 30°). There is **no dolly and no touch-drag**, since a
  drag would fight scrolling. The arrival sweep is the same.
- **Name planes** at 0.6 amplitude. The readout strip gets no scroll motion.

**Calm.** Rules stand as today. The name is flat. The scan renders **one static
frame** with its caption, snapshotted to a 2D canvas, followed by
`loseContext()`. Calm still says "he scans real places". The stage band is
static on mobile.

### 3.2 SchoolsEntry — `src/components/labs/SchoolsEntry.astro` (W5)

**Desktop**

- The `.schools__frame` top and bottom border rules become scrubbed hairlines
  (`[data-scrub="rule"]`): `scale: 0 1` to `1 1` over `entry 0` to `entry 40vh`,
  origin inline-start. The band draws itself open.
- Each `.schools__glyph` sits in a wrapper with `[data-depth="rise"]` and a
  staggered range (`--rise-offset: calc(i * 2vh)`).
- Each `.schools__lab` link becomes a `[data-tilt]` stage, max 4°. On hover the
  glyph wrapper (`[data-lift]`) translates to `translateZ(24px)`, tinted with
  the lab's `--lab-accent`.
- Lab name and question text stay flat. The existing `::before` accent bar is
  unchanged.

**Mobile.** Glyph wrappers slide in from `translate: -0.75rem 0` as each row
enters. Rules are scrubbed. `.press` adds `:active { scale: .985 }` on the link.

**Calm.** Exactly today.

### 3.3 Credo — `src/components/hero/Credo.astro` (unchanged, by design)

No change. The component documents "Deliberately no new motion", and both the
experience and robustness judges upheld it. It remains the opaque raised ink
caesura, and the stillness is what makes Selected Work land. Translucent
surfaces, extruded copies and weight scrubs were all considered and rejected.

### 3.4 Selected Work — `SelectedWork.astro`, `ProjectVisual.astro`, `pointerPreview.ts` (W4)

**ProjectVisual `layered` prop**

- Accent shapes get `data-accent`.
- With `layered`, the component emits the base `<svg data-visual>` unchanged,
  plus a sibling `<svg class="plate__lift" aria-hidden="true" data-lift>` with
  the same viewBox and `preserveAspectRatio`. The lift holds only the accent
  shapes and carries `data-draw` / `data-fade-in`, so it draws in with its plate.
  It has **no `data-visual`**, so `plateTransition`'s `svg[data-visual]` query
  and all five bursts are untouched.
- Inside `.plate-stage`, base `[data-accent]` shapes render at opacity 0.4. At
  rest the lift sits exactly over them, so the composite is pixel-identical to
  today. When separated, the base accent shows as a 40% "registration shadow".
- The plate transition clones only the base SVG into `.pt`, outside
  `.plate-stage`, so the clone renders at full accent. Both are sibling SVG
  roots, so each is compositable (unlike `<g>` children).

**Desktop (fine pointer)**

- **Carry.** A new inner `.project__plate-tilt` (the `preserve-3d` stage) sits
  inside the fixed `.project__plate`. `pointerPreview.ts` already eases current
  toward target. It now also computes the lag `(target - current)`, clamps it,
  and writes `--lean-x` / `--lean-y` **on the active row's `.project__plate-tilt`
  only**, not on the section.
- CSS: `transform: perspective(900px) rotateY(calc(var(--lean-x) * 10deg)) rotateX(calc(var(--lean-y) * -6deg))`,
  applied only while `[data-tilting]`. The lift layer gets
  `translate: 0 0 28px` while tilting.
- The plate leans the way it is carried and settles flat. When settled, the
  module removes `data-tilting`, so the stage is `transform: none`.
- On `pointerdown` on a row, lean is zeroed and snapped before the plate
  transition measures. The outer `.project__plate` rect, which `sourceBox()`
  reads, never changes.
- No `transform` or `perspective` on `.project`, `.project__link`,
  `.work__list` or `.wrap`.
- **Rows stay flat.** No "deal" on titles; the oversized titles are the reading
  surface.
- Keyboard-anchored plate (`.project:has(:focus-visible)`): no lean, no lift.

**Mobile / touch (cards)**

- `.project` declares `view-timeline: --card`. `.project__plate` keeps
  `overflow: hidden`; mobile lift is 2D, so no `preserve-3d` is needed and
  `sourceBox()` is unaffected.
- Over the `--card` range:
  - the base SVG goes `scale: 1.06` to `1` (window);
  - the lift goes `translate: 0 12px` to `0 -12px`, a visible diorama
    separation;
  - the plate wrapper rises 1.5rem to 0 on entry.
- `.press` on `.project__link`. The touch path of the plate transition is
  unchanged.

**Calm.** Plates are exactly today's single image. The lift sits flush. No lean.

### 3.5 What I Do — `src/components/services/WhatIDo.astro` (W5)

- **Desktop.** Each item's top rule is scrubbed. `.what__index` (the existing
  mono numeral) gets `[data-depth="drift"]` with `--drift: -0.6`, a far plane
  sliding slower than the row, at most 3vh. Body copy never moves.
- There is **no exit fade**: an earlier proposal's 0.45 opacity broke AA. There
  are no ghost numerals.
- **Mobile.** Rules are scrubbed. Index drift at 0.6 amplitude.
- **Calm.** Today.

### 3.6 Lab preview — `src/components/lab/LabPreview.astro` (W5)

- **Desktop.** The notebook under an instrument. A 1px `--c-lab` hairline
  (`.lab__list::after`, full width, absolutely positioned) moves
  `translate: 0 0%` to `0 100%` over the list's `view()` range `cover 20%` to
  `cover 80%`. That is composited. As each `.lab__item` crosses centre, its
  `.lab__num` colour moves from `--c-bone-faint` to `--c-lab` (a paint on 3-digit
  labels only, desktop only).
- The ink surface stays **opaque**. No card flips.
- **Mobile.** The same scan line, no colour scrub.
- **Calm.** Today.

### 3.7 About — `src/components/about/AboutTeaser.astro` (W5, with W6's `DepthPhoto`)

**Arc progress.** A `--c-bone-dim` hairline under `.about__arc` fills from
`scale: 0 1` to `1 1` across the section's `view()` timeline (`cover 10%` to
`cover 70%`). Reading progress through the prose *is* the arc. Signal orange is
not used.

**Cascade figure** (ships only after Denis's design sign-off, behind
`showCascade` in the component)

- A small inline SVG of the three-ball cascade (siteswap 3: the figure-eight
  path) in the empty right side of the section head on desktop. It is a diagram
  of the pattern he teaches, in the same register as the generated plates, not
  evidence of a performance.
- The three balls use `offset-path` along the lemniscate. `offset-distance` is
  scrubbed by the About view timeline, phase-shifted by a third each, so it
  juggles only while you scroll and rests when you stop.
- `aria-hidden`. Mobile: smaller, beside `.section__label`.
- Calm: a static diagram with the balls at their notation positions.

**Photo slot**

- `<DepthPhoto placement="about">` renders **only if** `src/data/photos.ts` has
  `about` entries (1–2 frames: circus, snowboard).
- Desktop: columns 8–12, beside `.about__pull`, 4:5.
- Mobile: full-bleed 4:5 between the pull quote and `.about__prose`. Prose and
  pull quote stay flat.

**Calm.** Static diagram, plain framed photos with captions.

### 3.8 Currently — `src/components/currently/Currently.astro` (W5)

Intentionally the quietest section. Row rules are scrubbed. Nothing else: no
pulses and no autonomous motion. The same on mobile. Calm is today.

### 3.9 Contact — `src/components/contact/ContactTeaser.astro` (W5)

- **The landing.** `.contact__title` sits in a wrapper with
  `[data-depth="approach"]`: `translate: 0 3rem` to `0` and `scale: .96` to `1`,
  over `entry 0` to `entry 30vh`, finishing before the reading band.
- The `.contact__stroke` keeps its existing `is-drawn` reveal; it is not
  scrubbed, so it can never be stuck half drawn.
- `[data-magnetic]` actions get no scroll animation.
- **Mobile.** Approach at 0.6 amplitude.
- **Calm.** Today.

### 3.10 Footer — `src/components/contact/SiteFooter.astro` (W5)

- **Bookend.** The hero's column rules return. 12 rules (4 below 48rem) sit
  absolutely behind `.footer__inner` (footer gets `position: relative`) and rise
  `scale: 1 0` to `1 1` (origin bottom) over the footer's entry range. The grid
  that opened the page closes it.
- **Calm toggle.** A `<button data-motion-toggle aria-pressed>` labelled
  "Calm motion", localised, 44px target, next to `.footer__top`.
- **Calm.** Rules stand static. Back to top is a native anchor.
  `scroll-behavior` becomes `auto` under calm.

### 3.11 SiteNav — `src/components/navigation/SiteNav.astro` (W5)

A second instance of the same toggle, so the control is reachable *before* any
motion is met (robustness must-fix). It is a mono text button beside the
language toggle on desktop and inside the language panel on mobile. Both
toggles are wired by one `initMotionToggles()`.

### 3.12 Project case study — `src/pages/[lang]/projects/[slug].astro` and `EmbedFrame.astro` (W7)

**Arrival.** Unchanged: plate transition, then enter cover, then panels. The h1
is never hidden (LCP).

**`.project-page__plate`** (plate-led projects)

- `ProjectVisual layered` inside a `[data-tilt]` stage, desktop only, ≤ 6°.
- `[data-depth="recede"]` on exit: `scale` 1 to 0.96 and `translate` 0 to -3vh;
  desktop adds `rotate: x 6deg`.
- The plate that just grew into the page shows it was layered all along.

**Hero media (priority / LCP image).** Only the Tier 0 window parallax, which is
`translate` and `scale` inside its frame. **Never opacity.** `fetchpriority` and
`loading="eager"` are untouched. No Tier 1 shader on the priority image.

**Evidence, by kind** (MediaFigure, W6)

| Kind | Treatment |
| --- | --- |
| photo | Tier 0 window parallax. Tier 1 depth shader only if a `-depth.webp` sibling exists and consent is `adult`. |
| generated (e.g. the point-cloud render) | Tier 0 |
| screenshot | "Monitor settle": desktop `rotate: x 6deg` to 0 over `entry 0` to `entry 25vh`; mobile translate only |
| diagram | Never moves (readability) |
| video | Never moves |

**Section labels.** `.project-page__section-label` becomes
`position: sticky; inset-block-start: 6rem` at ≥62rem. That gives a two-plane
reading with zero JS.

**Next project.** `.project-page__next-title` in an `approach` wrapper. Behind
it sits the next project's `ProjectVisual` as an `aria-hidden` far-depth ghost
at opacity 0.22, with `drift: -1`, ≤ 4vh. It is **not** wired to
`initPlateTransition`, which would add a second document listener.

**Splatoo `EmbedFrame`**

- *Without* a Splatoo scan in `scans.ts`: the poster's ProjectVisual is a tilt
  stage on desktop. Nothing else.
- *With* a Denis-supplied, approved Žďár export:
  - after idle and visible, `pointScan` mounts in `poster` mode over the plate
    (desktop 12k points, mobile 5k);
  - desktop hover orbits ±15°; mobile horizontal drag with
    `touch-action: pan-y`, horizontal only;
  - the "Load scene" button stays the primary target and is excluded from the
    drag surface.
- On click, a **capture-phase** listener on `[data-embed-load]` synchronously
  snapshots, tears down and `loseContext()`s the canvas. The existing handler
  then runs unchanged: replace poster, `frame.focus()`, `{ once: true }`,
  sandbox. There is **no collapse animation**, because the existing handler
  swaps in the same dispatch.
- `figure[data-loaded]` (one new line in the handler) strips every transform
  and `data-tilt`, so the iframe never sits in a 3D context.

**Mobile.** Plate recede is scale-only, sticky labels are off, and photos get
Tier 0 scroll parallax. Tier 1 uses scroll offset, at most one GL context.

**Calm.** Flat plate, still photos, static poster frame if a scan exists.
Embed behaviour is unchanged.

### 3.13 Project labs — `laby/index.astro`, `laby/[slug].astro` (W7)

**Index**

- Desktop: `.lab-card` becomes a tilt card, max 6°.
  - `.lab-card__plate` uses `ProjectVisual layered`, with its lift in the lab's
    `--lab-accent`.
  - `.lab-card__glyph` gets `translate: 0 0 24px` while tilting.
  - Card text is flat.
- `.formats__row` rules are scrubbed. `.group__figure` ("6–10") drifts near
  (`--drift: 0.5`).
- Mobile: card plates use the same `--card` diorama as Selected Work, plus
  `.press`.

**Detail**

- `.lab-hero__plate` is a tilt stage on desktop with recede on exit.
- Blocks, formats and contact rows stay flat; they are a brief for teachers and
  must read instantly.
- Workshop photos with children get **Tier 0 only**, and only with consent
  recorded in `photos.ts`.

**Calm.** Today.

### 3.14 Lab notebook — `lab/index.astro` (W7), `lab/[slug].astro` (unchanged)

- Index: the LabPreview instrument scan line, copied into the page's scoped
  style, down the full experiment list.
- Notes (`[slug]`): **no new motion**, per `docs/motion-references.md`
  Reference 08: the least-finished pages must not be the most decorated.

### 3.15 Gate, 404, transition cover, cursor field

Untouched. `BaseLayout` skips `initDepth` and the toggle on
`variant === 'gate'`. All depth CSS is attribute-driven, so the 404 has
nothing to match. `.pt`, `.transition-cover` and `.cursor-field` keep their
stacking, because no ancestor gains a transform.

---

## 4. Photographs (Denis is choosing them now)

Photos are evidence. The real `<img>` is always visible, crisp, accessible and
the LCP or alt carrier. Depth is only ever added on top. Nothing is hidden to
stage an effect.

### Where they go

| Slot | Content | Ships when |
| --- | --- | --- |
| About | 1–2 frames (circus, snowboard), 4:5 | `photos.ts` has `about` entries |
| Case study hero + evidence | `circus-movement`, `snowboard-coaching` (and any other project) | added to `evidence.ts` as `kind: 'photo'` |
| Laby detail | Workshop photos, Tier 0 only | consent recorded |
| Selected Work | **Stays generated SVG.** The plate transition is built from it. A photo cover needs a separate future plate-transition "photo mode", out of scope. | — |

### Data

- `src/data/photos.ts` is a new registry: `id`, `src`, `alt` (en/cs/sk, written
  by Denis and never generated; missing alt → `aria-hidden`), `focal: [x%, y%]`,
  `readout: { place, year, discipline }`, `placement`,
  `consent: 'adult' | 'guardian-consent-on-file' | 'non-identifiable'`,
  `depth?: boolean`.
- `src/data/evidence.ts` gets optional `focal`.

### Pipeline (offline, dev machine)

- `scripts/build-image-variants.mjs` also processes `public/media/photos/`:
  - WebP at 640, 960 and 1440 px
  - a 24 px blurred LQIP as a `data:` URI (img-src already allows `data:`)
  - always `width`/`height`, so CLS stays 0
  - output to `src/data/generated/photos.json`
- `scripts/build-depth-maps.py` runs Depth-Anything-V2-**Small** (Apache-2.0;
  Base and Large are CC-BY-NC) locally, like `render-pointcloud.py`. It writes
  `<name>-depth.webp` (8-bit, half resolution, dilated 3 px to hide edge
  tearing). It is not part of the build and adds no npm dependency.

### Tiers

- **Tier 0, every photo, CSS only.** Inside an `overflow: hidden` frame the
  `<img>` sits at `scale: 1.08`. A named view timeline (`--frame`) on the figure
  moves it `translate: 0 -3%` to `0 3%`. `object-position` comes from `focal`,
  so faces and boards stay in frame on both the 4:5 and 3:2 crops. The figure
  rises on entry; a priority image never does.
- **Tier 1, hand-picked only.** This applies when a `-depth.webp` sibling exists
  (`existsSync`, the same convention as `-640w`) and `consent === 'adult'`.
  `src/motion/media/depthPhoto.ts` adds a WebGL2 quad over the image:
  - the fragment shader offsets UVs by `(depth - focalDepth) * offset`, with
    mirror clamping;
  - offset is the eased pointer on desktop (max 1.2% of width) and scroll
    progress on mobile (max 0.8%);
  - it mounts on the first pointer or scroll input after idle, not on idle
    alone;
  - it decodes with `createImageBitmap`, using at most the 960w file;
  - the canvas fades in only after its first drawn frame, and on any failure the
    `<img>` is simply what you see;
  - it gets one context from W2's pool and is torn down 10 s after leaving the
    viewport, with no re-mount churn inside that window;
  - never on photos of children.
- **Readout.** A mono `figcaption` (`place · year · discipline`) sits under the
  frame. On a desktop tilt stage it floats at `translateZ(16px)`, like a HUD
  label in a point-cloud viewer. It is real text: findable and readable.

### Brief for Denis's selection

- Clear figure and ground separation: a juggler against a dark stage, a rider
  against snow or sky.
- Mid-action rather than posed to camera.
- At least 2400 px on the long edge.
- One vertical (4:5) and one horizontal (3:2) frame per subject.
- Grade offline toward the warm ink/bone palette. Never with CSS filters.
- Children: only with written consent, ideally from behind or at a distance,
  and never Tier 1.
- Write alt text for each. Drop files in `public/media/photos/`, then run
  `npm run images`, then optionally `python scripts/build-depth-maps.py <file>`.
  `public/media/photos/README.md` documents this.

---

## 5. Technology

### 5.1 `src/styles/depth.css` (W1)

Imported from `global.css` after `motion.css`. Every animated rule is inside
`@supports (animation-timeline: view())`,
`@media (prefers-reduced-motion: no-preference)` and `:root:not([data-calm])`.
Every `animation` shorthand is followed by `animation-timeline` and
`animation-range`, because the shorthand resets them.

| Attribute | Effect | Range | Mobile (<48rem) |
| --- | --- | --- | --- |
| `[data-depth="rise"]` | `translate: 0 2rem` to 0, `rotate: x 8deg` to 0 (origin top) | `entry 0` to `entry 25vh` + `var(--rise-offset,0)` | translate 1.25rem, no rotate |
| `[data-depth="recede"]` | `scale` 1 to .96, `translate: 0` to `0 -3vh`, `rotate: x 0` to `6deg` | `exit 0` to `exit 30vh` | no rotate |
| `[data-depth="drift"]` | `translate: 0 calc(var(--drift) * 3vh)` to `0 calc(var(--drift) * -3vh)` | `cover` | ×0.6; decorative only |
| `[data-depth="approach"]` | `translate: 0 3rem` to 0, `scale: .96` to 1 | `entry 0` to `entry 30vh` | ×0.6 |
| `[data-depth="window"]` | img `scale: 1.08`, `translate: 0 -3%` to `0 3%` | `--frame` (on figure) | same |
| `[data-scrub="rule"]` | `::before` `scale: 0 1` to `1 1` | own `view-timeline: --rule`, `entry 0` to `entry 40vh` | same |
| `[data-tilt]` + `[data-tilting]` | `transform: perspective(var(--persp)) rotateX(..) rotateY(..)` from `--tilt-x/--tilt-y` | pointer | none |
| `[data-lift]` in a tilting stage | `translate: 0 0 var(--lift)` | pointer | 2D drift instead |
| `.press` | `:active { scale: .985 }` (transition) | touch | yes |

**Tokens** (`tokens.css`)

- `--persp: 1100px` (800px below 48rem)
- `--depth-amp: 1` (0.6 below 48rem)
- `--tilt-max-x: 4deg`, `--tilt-max-y: 6deg`
- `--lift: 24px`
- `--floor-max-rot: 50deg`
- a `html[data-calm]` block duplicating the `--motion-mult: 0.012` collapse

`reset.css` gets `html[data-calm] { scroll-behavior: auto }`.

**Budget.** Core `depth.css` ≤ 2.5 KB gz. Every byte is inlined into all 152
pages (`inlineStylesheets: 'always'`).

### 5.2 JS runtime (W1)

**`src/motion/utils/env.ts`**

- `prefersReducedMotion()` also returns true when `html[data-calm]` is set, so
  every existing module (scrollReveal, plateTransition, cursorField,
  pointerPreview, pointerField, magnetic, enterReveal) obeys calm with no
  per-module wiring.
- New `onMotionPreferenceChange(h)`: media query plus an `irl:motionchange`
  event.
- New helpers:
  - `supportsScrollTimeline()`
  - `canAffordGL()`: WebGL2 present, not `saveData`, `deviceMemory ≥ 4` when
    known, `hardwareConcurrency ≥ 4`
  - `idle(cb, timeout)`: `requestIdleCallback` with a `setTimeout` fallback
    for Safari
- Existing exports keep their signatures.

**`src/motion/depth/index.ts`** — `initDepth()` waits for `REVEAL_EVENT`, then
idle. It adds `html.depth-ready` and dynamic-imports `tilt.ts` only on a fine
pointer when not calm.

**`src/motion/depth/tilt.ts`**

- One delegated `pointermove`, mouse only.
- The stage rect is read once on `pointerenter`.
- An eased `createLoop` writes `--tilt-x` and `--tilt-y` on the active stage
  only, and sets `data-tilting` and `will-change: transform` only during
  interaction.
- It springs back, then stops. It ignores `[data-loaded]` and never reacts to
  focus.

**`src/motion/depth/motionPreference.ts`** — `initMotionToggles()` handles
every `[data-motion-toggle]`:

- toggles `html[data-calm]`;
- persists `irl:motion` to `localStorage` inside try/catch;
- dispatches `irl:motionchange`;
- under OS reduce, shows pressed and disabled with the label
  "Calm (system setting)".

New modules (depth, tilt, the GL engine) tear down live. Existing modules that
read the preference at init apply it on the next page; the label says so.

**`BaseLayout.astro`**

- The boot script additionally runs
  `try{if(localStorage.getItem('irl:motion')==='calm')document.documentElement.setAttribute('data-calm','')}catch(e){}`
  before first paint. `integrations/csp.mjs` re-hashes it automatically.
- The module script adds `initDepth()` and `initMotionToggles()` next to
  `initCursorField()`.
- Neither runs on the gate.

### 5.3 Point-scan engine (W2)

Raw WebGL2, no library. three.js would be about 45 KB gz or more to draw one
point shader. OGL (~9 KB) is the named fallback only if the hand-written
renderer proves costly to maintain.

**`src/motion/ambient/mount.ts`** — the scheduler and contract enforcer.

- Start sequence: `REVEAL_EVENT`, then `load`, then `idle(2500)`, then
  `whenVisible(host)`, then dynamic `import()` of the engine chunk. Gated by
  `canAffordGL()` and calm (calm means a static frame).
- **Governor**
  - It measures only frames that actually draw, after link.
  - A stable cadence of about 33 ms with low variance is treated as a refresh
    cap (iOS Low Power Mode, 30 Hz Android), not as slowness.
  - Slow means median above 22 ms at 60 Hz, or above 40 ms at 30 Hz, over 45
    frames.
  - Slow halves the point count. If it is still slow, the engine freezes: it
    snapshots to a 2D canvas, then destroys the loop and the context.
- **Context pool.** At most 1 live context on touch devices and 2 on desktop.
  The engine and `depthPhoto` both request from it. An off-screen holder is
  snapshotted and released first.
- **Pauses.** `MutationObserver` on `html` attributes pauses for
  `[data-entering]` and `[data-plate-transition]`.
- **Lifecycle.** `onMotionPreferenceChange` means static frame plus release.
  `pagehide` means teardown; `pageshow` with `persisted` means remount.
- **Context loss.** `webglcontextlost` calls `preventDefault()` and hides the
  canvas. `webglcontextrestored` rebuilds and re-uploads.

**`src/motion/ambient/gl.ts`**

- Context options: `{ alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false, failIfMajorPerformanceCaveat:true, powerPreference:'low-power' }`.
  SwiftShader and blocklisted GPUs get *no* scan instead of a slow one.
- Compile and link use `KHR_parallel_shader_compile` with `COMPLETION_STATUS`
  polling across frames. Without the extension (check Safari), it compiles in
  one idle callback and reads `LINK_STATUS` in the next. There is never a
  synchronous status query in the same task.
- `resize(renderScale(1.5))` on desktop and `renderScale(1.25)` on touch.
- `snapshotTo2D()` draws into a 2D canvas in the same task as the last draw,
  then swaps it in.
- `destroy()` calls `WEBGL_lose_context.loseContext()`.

**`src/motion/ambient/pointScan.ts`**

- Signature:
  `mount(host, { src, mode: 'hero' | 'poster', sweep, masks, inputs }) => { setYaw, setPitch, setDolly, teardown }`.
- Points are int16 xyz plus uint8 luminance, read through typed-array views
  with no parse step. Upload happens in its own task.
- One program, `gl.POINTS`, one draw call. Point size comes from the
  projection. The fragment shader draws a Gaussian falloff (premultiplied, ONE /
  ONE_MINUS_SRC_ALPHA) with depth fog and a sweep-plane reveal uniform.
- Mask rects are dimmed by 80%.
- The loop stops whenever no input changed and no sweep is playing.

**Shaders** are string literals in TS: no `eval`, `new Function`, `blob:`,
workers or CDN. CSP and `vercel.json` are unchanged; data is fetched from
`'self'`.

**Scan data**

- `scripts/build-scans.mjs`:
  - parses the binary PLY header and vertices from Denis's local file (default
    `kasna.ply`; `--src` accepts `Michel Rodange monument.ply` or a Splatoo
    export);
  - voxel-grid downsamples to 10k (desktop) and 4k (mobile);
  - re-orients with `--up` and `--yaw`, normalises to bounds, and Morton-sorts
    for compressibility;
  - if the PLY has per-vertex UVs, it samples luminance from the diffuse
    texture; otherwise it writes a constant 200. The kasna export has no vertex
    colours, so the result is honest monochrome geometry;
  - writes `public/assets/scans/<id>-<hash>-{desktop,mobile}.bin` with a header
    (`DMS1`, count, float32 bounds ×6, flags).
- Sizes: ≤ 70 KB desktop and ≤ 28 KB mobile. These are counted raw, assuming
  octet-stream may not be gzipped.
- `src/data/scans.ts` is a typed manifest: `id`, `placement` (`hero` |
  `poster:<slug>`), `files`, `pointCount` (source and shipped), `bounds`,
  per-locale `caption` (6 locales, falling back to en), `href` to the source
  case study or lab note, `credit`, and `approvedByDenis: boolean`. The build
  renders nothing unless it is `true`.
- Fetches use `fetch(url, { priority: 'low' })`. The desktop file is never
  requested on touch devices, including desktop-width tablets, and never under
  `saveData`.

### 5.4 JS budget: 11 KB gz of new JS, of which about 2 KB is on the initial path

| Chunk | Loads | Cap (gz) |
| --- | --- | --- |
| `depth/index.ts` + `motionPreference.ts` + env deltas + pointerField/pointerPreview deltas | initial deferred module | **2.0 KB** |
| `depth/tilt.ts` | idle, fine pointer only | 1.3 KB |
| `ambient/mount.ts` | idle, pages with a scan or Tier 1 photo | 1.3 KB |
| `ambient/gl.ts` + `pointScan.ts` (incl. GLSL) | idle + visible + `canAffordGL` | 4.5 KB |
| `media/depthPhoto.ts` | first input, Tier 1 pages only | 2.0 KB |
| **Total** | | **≈ 11 KB** |

**Why this is affordable.** The homepage ships about 9.5 KB gz of JS today, in
an 18.4 KB gz HTML document.

- Initial-path JS grows by at most 2 KB, all deferred.
- Everything else is lazy, idle-scheduled and visibility-gated, and it is
  absent on reduced-data or low-memory devices.
- The animation work itself is done by the compositor (CSS scroll timelines),
  not by script.
- Inline CSS caps: homepage +5 KB gz; case study, laby and lab +3 KB gz each,
  measured against `scripts/budget-baseline.json`.

### 5.5 LCP and TBT protection

- Nothing new on the critical path gets a hidden state. Every scroll primitive
  is identity at scroll 0.
- Canvases are not LCP candidates and mount after `REVEAL_EVENT`, `load` and
  idle.
- The mobile stage band is static markup, so CLS is 0.
- Shader compile and buffer upload are split into separate tasks under 50 ms.
- Lighthouse lab runs use SwiftShader, so `failIfMajorPerformanceCaveat` means
  the scan never runs in Lighthouse. The ≥ 95 score is therefore necessary but
  **not sufficient**. W8 adds real-GPU traces and real-device runs as merge
  gates.

---

## 6. Reduced motion and Calm

Both are triggered by `prefers-reduced-motion: reduce`, or by `html[data-calm]`
set from either toggle (nav or footer) and applied before first paint.

- **depth.css does not exist.** Every element sits in its identity state, which
  is the designed composition. Floor rules stand, the name is flat, plates are
  single images, rules are drawn, and photos are plain frames with captions.
- **Existing behaviour is kept.** Reveals are instant. The language cover
  crossfades. The plate transition is a plain link. `--motion-mult` is 0.012.
  `scroll-behavior` is `auto`.
- **Hero scan.** One static frame plus the caption, snapshotted to 2D, then the
  GL context is released. It is not rendered at all on devices gated out by
  `canAffordGL()`.
- **Splatoo poster.** Static frame or plate. The iframe still loads on click.
- **About cascade.** Static diagram.
- **Tier 1 photos.** Never mounted.
- **Live changes.** New modules tear down immediately. Existing modules apply
  calm on the next navigation. The toggle label states this.

---

## 7. Accessibility

- **Scrolling, keyboard, anchors, find-in-page and screen readers are
  untouched.** Every canvas and decorative SVG is `aria-hidden` with
  `pointer-events: none`, except the opt-in Splatoo poster drag, which uses
  `pan-y` and is horizontal only.
- **Meaning lives in text.** The scan caption is a focusable link, photo alt
  stays on the `<img>`, and readouts are a real `figcaption`.
- **Vestibular limits** are written in tokens:
  - pointer tilt ≤ 6°; the carried preview plate ≤ 10°/6°, because the user is
    moving it;
  - scroll rotations ≤ 8° on desktop and 0° on mobile;
  - the floor is ≤ 50°, low contrast, confined to the hero and scrolls away;
  - scan yaw ≤ 24–30°, applied to a bounded object, not the whole view;
  - dolly ≤ 8% on desktop and none on mobile;
  - HTML scale stays between 0.96 and 1.08;
  - no full-screen optic flow anywhere.
- **No autonomous motion over 5 s** (WCAG 2.2.2). The scan sweep is about 2 s,
  once.
- **Contrast.** Scan alpha ≤ 0.22, plus mask rects behind text, plus a W8
  pixel-sampling check of `.hero__statement`, `.hero__intro` and caption
  contrast (AA 4.5:1 for body, 3:1 for large text) on screenshots with the scan
  rendered by real-GPU Chrome. Lighthouse cannot see canvas pixels.
- **Focus.** Tilt never reacts to focus. Focused elements are at identity, and
  focus rings are never transformed away.
- **The toggles** are real `<button aria-pressed>` elements, localised in all 6
  locales, with 44 px targets.
- **No-JS.** Nothing new is hidden. Native-timeline effects are pure CSS and
  rest at identity. The scan caption is a JS-only visual's caption.

---

## 8. Integration with existing modules

| Module | What changes |
| --- | --- |
| `scrollReveal.ts`, `[data-reveal]` CSS | Unchanged. Depth always goes on wrappers or children. `is-drawn` also draws the lift SVG. |
| `language/enterReveal.ts` | Unchanged. `REVEAL_EVENT` is the single start signal; nothing new starts under the cover. The engine pauses on `html[data-entering]`. |
| `projects/pointerPreview.ts` | Adds a lean computation from its existing lerp, written on the active `.project__plate-tilt`, plus a zero-on-`pointerdown`. Loop and self-stop unchanged. |
| `projects/plateTransition.ts` | No functional change expected. W4 owns it and verifies all 5 bursts × pointer/touch/keyboard start pixel-identical. The clone takes only `svg[data-visual]`. |
| `pointer/cursorField.ts` | Unchanged; it stays on top (`--z-gate`). |
| `hero/pointerField.ts` | Writes `translate` instead of `transform` (one line plus teardown). |
| `magnetic.ts` | Unchanged; `[data-magnetic]` is excluded from depth. |
| `EmbedFrame.astro` | One line (`figure.dataset.loaded = ''`) plus an optional capture-phase teardown listener. Click-to-load, sandbox, focus and the no-JS link are unchanged. |
| `integrations/csp.mjs`, `vercel.json` | Unchanged. The boot snippet hash is recomputed automatically. No sensors are used, so Permissions-Policy is untouched. |
| `ambient/README.md` | Rewritten from "reserved" to document `mount.ts`, `pointScan` and `depthPhoto` as the first modules meeting the contract. |

---

## 9. Judges' must-fix items and how this plan resolves them

| Must-fix | Resolution |
| --- | --- |
| Fixed floor at `--z-ambient` paints over non-positioned Credo | No fixed floor. The floor is inside the hero, `position: absolute`, under `.hero__inner` (`z-index: 1`). |
| Floor vestibular cost (68°, travelling) | 50° token, confined to the hero, scrolls away, calm disables it. |
| pointerField `--hx/--hy` invalidate the hero subtree | Writes individual `translate` directly on each layer. |
| `fill-mode: none` does not release layers; layer explosion | Fill rules per primitive, wrappers instead of items, a ≤ 12-layer cap, and a DevTools Layers check as a **merge gate** (W8). |
| Soft text and raster layers in 3D (Safari) | Rest is `transform: none`. No stroked text copies or 12rem numerals. No 3D on mobile. |
| Safari 26 compositor claim unverified | W1 day-1 spike measures main-thread cost per scroll frame on a real iPhone. Percentage ranges are the fallback if length offsets fail. |
| JS fallback runs on the weakest devices | Removed. Firefox and iOS < 26 get the static site. |
| Calm not global / not pre-paint / footer-only | `prefersReducedMotion()` honours `data-calm`; boot-script read; `--motion-mult` and `scroll-behavior` collapse; toggle in the nav too. |
| Owner rule broken on `.hero__aside` / `.hero__disciplines` | No scroll animation on them; pointer only, via `translate`. |
| Kinetic `rotateX` on `.line__inner` flattened and touching LCP | Dropped. |
| Mobile rotations | None below 48rem. |
| Preview lean jumps at transition start | Lean zeroed on `pointerdown`; the outer plate rect is never transformed. |
| `<g>` layers not compositable | The lift is a sibling `<svg>` root. |
| `failIfMajorPerformanceCaveat` missing | Set in `gl.ts`. |
| Governor misreads 30 Hz | Cap detection; only drawn frames measured. |
| renderScale 1.75 default | 1.5 desktop / 1.25 touch. |
| Synchronous LINK_STATUS | Parallel-compile polling or split idle callbacks. |
| depthPhoto long tasks | `createImageBitmap`, ≤ 960w, mount on first input, 10 s teardown. |
| Desktop scan file on touch | Never requested on touch, including tablets. |
| Embed collapse cannot play before the swap | No collapse; synchronous capture-phase teardown. |
| Currently pulse over 5 s | No pulse. |
| WhatIDo fade below AA | No fade. |
| Contact stroke stuck half-drawn | Keeps the existing `is-drawn` reveal. |
| Dolly behind the name on mobile | No dolly on mobile; the scan sits in its own stage band. |
| `webglcontextlost` without `preventDefault` | Handled with rebuild on restore. |
| Next-project transition double-wiring | No transition wiring; ghost plate only. |
| Credo "Deliberately no new motion" | Respected. |
| Procedural fake scans / invented evidence | Real captured vertices only, `approvedByDenis` gate. |
| No phone signature | "The stage" plus card dioramas. |
| Nothing from Denis's real 3D medium | The hero is his real scan. |
| Tilt chip / iOS permission prompt | Not shipped. |
| Persistent world on `/lab` and prose | Not shipped. |
| Photos hidden for assembly | Never; additive only. |
| SiteNav blur over an animating canvas | No full-page canvas, so the nav sits over static content. |
| Reduced-motion static frame keeps a live context | Snapshot to 2D, then `loseContext`. |

---

## 10. Work items

There are 8 items. Shared files have exactly one owner:

- `BaseLayout.astro`, `global.css`, `tokens.css`, `reset.css` and `env.ts`
  belong to **W1**;
- `package.json` belongs to **W8**;
- i18n belongs to **W5**;
- `ProjectVisual.astro` belongs to **W4**.

**W1 freezes its public API on day 1** (attribute names, env helper
signatures, token names), so W2–W8 can start immediately against it.

### W1: Depth foundation, calm plumbing and layout wiring

**Files**

- `src/styles/depth.css` (new)
- `src/styles/global.css`
- `src/styles/tokens.css`
- `src/styles/reset.css`
- `src/motion/utils/env.ts`
- `src/motion/depth/index.ts`
- `src/motion/depth/tilt.ts`
- `src/motion/depth/motionPreference.ts`
- `src/motion/depth/README.md`
- `src/layouts/BaseLayout.astro`

**Depends on:** none.

**Spec**

- Build the primitives table in §5.1 with the triple gate (`@supports`,
  no-preference, `:not([data-calm])`), the mobile variants, the tokens, the
  `data-calm` `--motion-mult` block and `scroll-behavior: auto`.
- `env.ts` additions as in §5.2. Existing exports keep their behaviour, except
  that `prefersReducedMotion()` now honours `data-calm`.
- `initDepth`, `tilt.ts` and `initMotionToggles` as in §5.2.
- BaseLayout: the boot-script calm read (try/catch), module wiring, nothing on
  the gate.
- README: attribute API, owner rule, forbidden ancestors, flattening rules,
  reading band, layer budget.
- Day-1 spike (half a day): on a real iPhone with iOS 26 and on Chrome Android,
  verify length-offset `animation-range`, named view timelines on pseudo
  elements, `rotate: x` individual property, and per-scroll-frame main-thread
  cost. Record results in the README. If length offsets fail, switch primitives
  to percentage ranges.

**Acceptance**

- Core `depth.css` ≤ 2.5 KB gz.
- With OS reduce or `data-calm`, computed `animation-name` is `none` on all
  `[data-depth]`.
- `data-calm` is set before first paint (no flash) and survives reload.
- Under `data-calm`, `prefersReducedMotion()` returns true.
- Firefox renders exactly today's site.
- The tilt module never loads on touch.
- The gate and the 404 have no new JS.

### W2: Point-scan engine and scan data

**Files**

- `src/motion/ambient/mount.ts`
- `src/motion/ambient/gl.ts`
- `src/motion/ambient/pointScan.ts`
- `src/motion/ambient/README.md`
- `scripts/build-scans.mjs`
- `src/data/scans.ts`
- `public/assets/scans/*`
- `tools/scan-harness/index.html`
- `tools/scan-harness/main.ts`

**Depends on:** W1 (env helper signatures only).

**Spec**

- §5.3 in full: scheduler, governor with 30 Hz cap detection, context pool
  (1 touch / 2 desktop), pauses, `pagehide`/`pageshow`, context loss with
  `preventDefault` and rebuild, snapshot-to-2D then `loseContext`, parallel
  compile, `renderScale` caps, `failIfMajorPerformanceCaveat`.
- `pointScan` hero and poster modes, sweep, masks, loop that stops when idle.
- `build-scans.mjs` reads `kasna.ply` by default (path via `--src`, never
  committed), voxel-decimates to 10k/4k, Morton-sorts, and writes hashed
  `.bin` files. Captions are filled with Denis (place, year).
  `approvedByDenis: false` until he confirms the hero scan.
- The harness is a standalone Vite page outside Astro routes, so it never
  ships. It has yaw, pitch, dolly and sweep sliders plus a frame-time overlay.

**Acceptance**

- `gl.ts` + `pointScan.ts` ≤ 4.5 KB gz; `mount.ts` ≤ 1.3 KB gz.
- No long task over 50 ms during init with 4× CPU throttle.
- Zero rAF callbacks 2 s after input stops.
- With `--disable-gpu`, or software GL, no canvas is created.
- After teardown there is no live context (checked with a counter).
- The `.bin` sizes are ≤ 70 KB (desktop) and ≤ 28 KB (mobile).

### W3: Hero (desktop floor and scan, mobile stage)

**Files**

- `src/components/hero/Hero.astro`
- `src/motion/hero/pointerField.ts`
- `src/motion/hero/heroScan.ts`

**Depends on:** W1, W2.

**Spec.** §3.1 in full.

- Rules floor on `scroll(root)` (desktop 8–70vh to 50°; mobile 4 rules,
  4–50vh).
- Name planes on `.line`.
- `pointerField` writes `translate`.
- Scan host, desktop mask, `data-scan-mask` on statement, aside and cue, and the
  `hidden` caption revealed on first frame.
- The mobile `.hero__stage` band (11rem, static) with the scan inside it.
- The hero's existing reveal script is unchanged; `heroScan` hangs off the
  same `REVEAL_EVENT`.
- Without an approved scan entry, no host and no caption are rendered.

**Acceptance**

- At scroll 0 the hero is pixel-identical to today on desktop, apart from the
  scan fading in after idle.
- LCP element and time are unchanged.
- CLS 0, including the mobile stage.
- Calm shows a static scan frame with the caption and no live context.
- Pointer parallax still works and composes with the reveal.
- Statement and intro contrast pass sampling with the scan visible.

### W4: Selected Work: layered plates and carry

**Files**

- `src/components/projects/ProjectVisual.astro`
- `src/components/projects/SelectedWork.astro`
- `src/motion/projects/pointerPreview.ts`
- `src/motion/projects/plateTransition.ts`

**Depends on:** W1.

**Spec.** §3.4 in full.

- The `layered` prop with `data-accent` and the sibling lift SVG (no
  `data-visual`, draws with the plate).
- Desktop: `.project__plate-tilt` stage, lean vars written on the active stage,
  zeroed on `pointerdown`, `data-tilting` only while moving.
- Mobile: `--card` view-timeline diorama (base window scale, lift ±12 px, plate
  rise) with `overflow: hidden` kept, plus `.press`.
- `plateTransition.ts`: change only what is needed (expected: nothing). Prove
  it.

**Acceptance**

- At rest every plate is pixel-identical to today in all 5 families.
- The fixed preview still tracks `clientX/Y` (Playwright).
- The plate transition starts pixel-identical for pointer, touch and keyboard
  in all 5 families.
- The keyboard-anchored plate has no lean.
- No transform or perspective on forbidden ancestors (lint).
- Calm shows exactly today's plates.

### W5: Homepage sections, motion toggles and i18n

**Files**

- `src/components/labs/SchoolsEntry.astro`
- `src/components/services/WhatIDo.astro`
- `src/components/lab/LabPreview.astro`
- `src/components/about/AboutTeaser.astro`
- `src/components/currently/Currently.astro`
- `src/components/contact/ContactTeaser.astro`
- `src/components/contact/SiteFooter.astro`
- `src/components/navigation/SiteNav.astro`
- `src/i18n/dictionary.ts`
- `src/i18n/translations/en.ts`, `cs.ts`, `sk.ts`, `es.ts`, `sr.ts`, `tr.ts`

**Depends on:** W1, W6 (the `DepthPhoto` component for About; can land
without it, since the slot renders nothing until photos exist).

**Spec**

- §3.2 and §3.5–3.11. Credo is not touched.
- Toggle labels in all 6 locales: "Calm motion", "Calm (system setting)", and
  a "Takes full effect on the next page" hint for existing modules.
- The About cascade is behind a `showCascade` constant, defaulting to `false`
  until Denis signs off.
- All effects are scoped `<style>` plus attributes. No new JS beyond placing
  `data-motion-toggle`.

**Acceptance**

- No depth attribute on any element that also carries `data-reveal`,
  `data-magnetic` or `data-parallax` (lint).
- Text is at identity in the reading band (Playwright: scroll each section head
  to 50% of the viewport and assert computed `translate` and `scale` are
  identity).
- Footer bookend: 12 rules, or 4 below 48rem.
- Both toggles work, persist, show disabled under OS reduce, and are reachable
  by keyboard with 44 px targets.
- Lighthouse a11y stays 100.
- The ink surfaces stay opaque.

### W6: Photo depth system

**Files**

- `src/components/media/DepthPhoto.astro`
- `src/components/media/MediaFigure.astro`
- `src/data/photos.ts`
- `src/data/evidence.ts`
- `src/motion/media/depthPhoto.ts`
- `scripts/build-image-variants.mjs`
- `scripts/build-depth-maps.py`
- `public/media/photos/README.md`

**Depends on:** W1, W2 (the context pool via `mount.ts`).

**Spec.** §4 in full.

- Registry with consent and `focal`; variants plus LQIP plus the generated
  manifest.
- `DepthPhoto` structure: `figure` > tilt stage > `overflow: hidden` frame >
  img (window) + `figcaption` readout.
- MediaFigure per-kind treatment (§3.12 table) and the `focal` to
  `object-position` mapping.
- Tier 1 detection via `existsSync` of the `-depth.webp` sibling plus
  `consent === 'adult'`.
- `depthPhoto.ts` as in §4.
- The priority image never gets opacity or Tier 1.

**Acceptance**

- No photo is ever at opacity 0 at rest, with or without JS.
- CLS 0.
- The priority image's LCP is unchanged.
- `depthPhoto.ts` ≤ 2 KB gz.
- A Tier 1 canvas appears only after its first frame and leaves the `<img>`
  visible on failure or context loss.
- Never more than one GL context on touch.
- The README lets Denis add a photo in 3 commands.

### W7: Case study, laby and lab index

**Files**

- `src/pages/[lang]/projects/[slug].astro`
- `src/components/media/EmbedFrame.astro`
- `src/pages/[lang]/laby/index.astro`
- `src/pages/[lang]/laby/[slug].astro`
- `src/pages/[lang]/lab/index.astro`

**Depends on:** W1, W2, W4 (`ProjectVisual layered`), W6.

**Spec**

- §3.12–3.14.
- `lab/[slug].astro` is explicitly *not* touched.
- EmbedFrame:
  - `figure.dataset.loaded` and the 3D strip;
  - the optional poster scan only when `scans.ts` has an approved
    `poster:splatoo` entry;
  - a capture-phase synchronous teardown;
  - existing click-to-load behaviour byte-for-byte except the one dataset line.

**Acceptance**

- The Splatoo click-to-load still inserts the sandboxed iframe and focuses it.
- No GL context is alive after the click.
- The h1 is never hidden.
- Sticky labels do not overlap the nav (`6rem` offset) and are off below 62rem.
- Note pages are unchanged.
- Workshop photos with minors never get Tier 1.

### W8: Verification, budgets and guards

**Files**

- `package.json` (scripts: `budget`, `scans`, `depth-maps`, `test:e2e`, `lhci`;
  devDeps `@playwright/test`, `@lhci/cli`)
- `scripts/check-budget.mjs`
- `scripts/budget-baseline.json`
- `lighthouserc.json`
- `playwright.config.ts`
- `tests/e2e/motion.spec.ts`
- `tests/e2e/regressions.spec.ts`
- `docs/motion-depth-qa.md`

**Depends on:** none to start. The script and baseline are written on day 1,
before any change lands. **It gates the merge of W1–W7.**

**Spec**

- `check-budget.mjs` runs on `dist/`:
  - gz sizes of inline CSS and initial JS per page type (home, case study,
    laby, lab) against the baseline (+5 / +3 KB caps);
  - per-chunk caps from §5.4;
  - scan `.bin` caps;
  - lint greps: depth on reveal, magnetic or parallax elements; `transform`,
    `perspective`, `filter`, `will-change` or `backdrop-filter` on forbidden
    ancestors; `animation-timeline` outside the triple gate.
- LHCI mobile on `/en/`, `/en/projects/splatoo/`,
  `/en/projects/circus-movement/`, `/en/laby/`, `/en/lab/` and the 404:
  performance ≥ 95, a11y = 100, CLS ≤ 0.01, TBT ≤ 50 ms, LCP ≤ 2.5 s.
- Playwright: see §11.
- QA doc: a real-device protocol (see §11) with results recorded per merge.

**Acceptance**

- `npm run budget` fails on a seeded violation of each kind.
- CI runs `budget`, `lhci` and `test:e2e` green on `feat/motion-depth`.

### Build order

```
day 1:  W1 (API freeze + spike)   W8 (baseline + script)   W2 (engine in harness, data script)
        W4 (plates, against W1 API)                         W6 (registry + pipeline)
then:   W3 (needs W2 engine)   W5 (needs W1; About slot after W6)   W7 (needs W2, W4, W6)
gate:   W8 full run + real-device protocol -> merge
```

---

## 11. Verification

**Automated (W8)**

- **No-JS:** all content and photos are visible; no hidden caption leaks; no
  canvas.
- **Reduced motion and `data-calm`:** zero running rAF loops after 2 s; the
  scan is a static 2D frame; computed animations are none.
- **Idle:** with no input for 3 s after load, rAF count is 0 (WCAG 2.2.2).
- **Reading band:** each section head scrolled to 50% has identity transforms;
  anchor jumps (`#work`, `#hero`) land on identity.
- **Regressions:**
  - the desktop cursor preview tracks the pointer;
  - the plate transition navigates for pointer, touch and keyboard in all 5
    families, and Escape, Enter or Space still skip;
  - the language enter-reveal plays; the 404 is unchanged;
  - Splatoo click-to-load inserts the sandboxed iframe, focuses it and leaves
    no live GL context;
  - the cursor field is unchanged.
- **Toggles:** persist across reload, are applied before first paint, and are
  disabled under OS reduce.
- **Layout:** no horizontal overflow at 360 px; CLS ≤ 0.01.
- **Long tasks:** none over 50 ms while scrolling the homepage under 6× CPU
  throttle in Chrome with real GPU (headed, `--use-gl=angle`), including scan
  init.
- **Contrast:** pixel sampling of `.hero__statement`, `.hero__intro` and the
  scan caption with the scan rendered meets AA.

**Real devices (manual, blocking for merge)**

- Mid-range Android (Moto G / Galaxy A class), Chrome: homepage scroll at 60 fps
  in a performance trace; DevTools Layers ≤ 12 animated layers per viewport; a
  10-minute scroll thermal soak with no governor freeze.
- iPhone 12 class, Safari 26: the same checks, plus Low Power Mode (30 Hz must
  not trigger degrade), plus backgrounding and return (context restore).
- iOS < 26 and Firefox: the static site, with nothing stuck in a "from" state.
- A 1440p/retina laptop: hero raster scale and scan cost at renderScale 1.5.

---

## 12. Risks and open decisions

| Risk | Mitigation |
| --- | --- |
| **Denis must approve the hero scan** (kasna or Michel Rodange) and supply place, year and caption | `approvedByDenis` gate; without it the hero ships with the floor only, which still delivers the signature. |
| Legibility over points cannot be checked by Lighthouse | Masks, alpha cap, pixel-sampling test, design sign-off per breakpoint. |
| Lighthouse never runs the scan | Real-GPU traces and the device protocol are merge gates. |
| Safari 26 support for length-offset ranges | Day-1 spike; percentage-range fallback. |
| Composited layer count on mobile GPUs | Wrappers, caps, Layers check. |
| Inline CSS growth hits all 152 pages | Per-page-type caps in CI. |
| The About cascade could read as decoration | Off by default until Denis signs off. |
| Photos of children | Consent field, Tier 0 only, non-identifiable framing; alt written by Denis. |
| Depth-map artefacts (hair, clubs, motion blur) | Offsets ≤ 1.2%, dilation; Tier 0 for any photo that looks wrong. |
| A future `html { background }` or ancestor transform breaks fixed layers | Lint plus regression tests. |
| Firefox and old-iOS parity gap | Accepted: progressive enhancement, the static site there is today's site. |
