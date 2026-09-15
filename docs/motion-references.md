# Motion references — CodePen research

**Status:** researched 2026-08-28. Nothing in this repository is copied from
any pen below.

## Method and honesty note

Each pen was opened and its visible source inspected in a browser. The notes
describe **what the technique is**, not what the code says line by line. Where
a technique is worth having, the plan is to re-implement the principle in our
own code — which is also why the language morph in `src/motion/language/`
shares no code with reference 04 even though they solve the same problem.

## Licensing

CodePen's default terms are permissive for public pens, but "permissive by
default" is not the same as "cleared for use". Before any pen's code is
literally reused:

1. Check the pen description and the author's profile for a stated licence.
2. If nothing is stated, **re-implement the principle** rather than copying.
3. Never embed a pen in an iframe. An external editor is not a dependency this
   site is willing to ship.

Assets are a separate question: reference 05 pulls photographs from Pexels.
Those are not ours, and none of them are in this repository.

---

## 01 — Sunset

- **URL:** https://codepen.io/JayNightmare/pen/JoENgdB
- **Author:** Jay
- **Principle:** A full-bleed generative sky rendered to a single canvas — a
  slow, atmospheric field rather than a discrete animation.
- **Technology:** Three.js, imported as an ES module from a CDN. One
  `<canvas>`, `overflow: hidden`, black page.
- **External dependencies:** Three.js (CDN, ESM).
- **Possible role here:** `motion/ambient` — a hero backdrop for the gate or
  for a future project detail page.
- **Mobile:** Risky as-is. A full-viewport WebGL scene on a mid-range phone is
  a battery and thermal cost for a background.
- **Performance risk:** High. Three.js is a large dependency for a decorative
  layer, and a permanent render loop is exactly what section 20 of the brief
  rules out.
- **Accessibility risk:** Low — decorative, needs `aria-hidden` and a reduced
  motion path.
- **Verdict: reference only.** If we ever want this, a hand-written WebGL2
  shader (see 06) costs a fraction of the bytes.

## 02 — Personal Website (Beta)

- **URL:** https://codepen.io/yahiarefaiea/pen/xyNWQq
- **Author:** Yahia Refaiea
- **Principle:** A whole personal site as one pen: stacked canvases (a star
  field behind, a name/graphic layer in front) with a template system that
  swaps coloured "screens" in place. Confident, personal, not a template.
- **Technology:** Two `<canvas>` elements, `data-template` sections, per-screen
  colour classes.
- **External dependencies:** None visible.
- **Possible role here:** The strongest *structural* reference of the nine —
  it is the closest to what this site wants to be: one continuous surface with
  swappable states, not a scroll of sections. Relevant to the gate → homepage
  handoff.
- **Mobile:** Good — the layout is type-led, and canvases are backdrops.
- **Performance risk:** Medium. Two live canvases; would need visibility
  gating.
- **Accessibility risk:** Medium. A template-swapping site needs focus
  management and real headings, which our version already has.
- **Verdict: adapt the idea, not the code.** Its "one surface, many states"
  model already informs the entry transition.

## 03 — WebGL Shader Hero Design

- **URL:** https://codepen.io/VoXelo/pen/ogbKQOy
- **Author:** Techartist
- **Principle:** Full-viewport shader canvas with a `position: fixed`,
  centred content block on top. The canonical "shader hero" arrangement.
- **Technology:** WebGL on a `100vh` canvas; styles inlined in the HTML pane.
- **External dependencies:** None visible.
- **Possible role here:** `motion/ambient/shaderHero` — the reserved slot
  documented in `src/motion/ambient/README.md`.
- **Mobile:** Needs a separate decision, not a smaller canvas. `100vh` is also
  the wrong unit on mobile browsers; we use `svb` throughout.
- **Performance risk:** Medium-high, entirely dependent on the fragment shader.
- **Accessibility risk:** Low if decorative; the content overlay must not
  depend on the canvas for contrast.
- **Verdict: adapt later.** This is the layout pattern for a hero shader when
  we add one. The `README` in `motion/ambient/` already encodes its rules.

## 04 — CSS Only, Morph Effect

- **URL:** https://codepen.io/karabharat/pen/wBWeOex
- **Author:** Kara Bharat
- **Principle:** **The most directly relevant pen of the nine.** Liquid text
  morphing achieved with an SVG filter: blur the layer, then push alpha
  through a threshold (`feColorMatrix`), so overlapping blurred glyphs fuse
  and separate like liquid. No JavaScript tweening of glyph shapes at all.
- **Technology:** SVG `<filter>` (blur + alpha threshold), CSS animation,
  Space Grotesk from Google Fonts, a noise overlay.
- **External dependencies:** Google Fonts (we self-host instead).
- **Possible role here:** `motion/language/greetingMorph` — the
  HELLO → AHOJ → HOLA → ZDRAVO → MERHABA sequence.
- **Mobile:** Good in principle, but SVG filters on large text are a real
  repaint cost on low-end devices; it would need a size cap.
- **Performance risk:** Medium. Blur + filter on `--t-mega` type is the single
  most expensive thing we could put on the first screen.
- **Accessibility risk:** Low, provided the morphing text is `aria-hidden` and
  a readable heading exists — which is how our gate is already built.
- **Verdict: adapt, next iteration.** v0.1 ships a cheaper per-glyph
  displacement + blur morph, written from scratch, because it is safe on every
  device. The threshold-filter version is the upgrade path, and it should be
  gated behind a capability and size check rather than shipped everywhere.

## 05 — 3d Galery

- **URL:** https://codepen.io/hoailongg/pen/EBMBQq
- **Author:** Hoài Phan
- **Principle:** Images arranged on a cylinder using CSS 3D transforms
  (`drag-container` / `spin-container`), spun by dragging, with a slow idle
  rotation.
- **Technology:** Pure CSS 3D transforms plus drag handling. No WebGL.
- **External dependencies:** None in code; **photographs are from Pexels** and
  are not ours to reuse.
- **Possible role here:** `motion/projects/projectGallery` — a spatial
  alternative to the Selected Work list.
- **Mobile:** Surprisingly good — dragging is a native touch gesture. But it
  competes with vertical page scroll and needs careful `touch-action`.
- **Performance risk:** Low-medium. CSS 3D is compositor work; many large
  images are the real cost.
- **Accessibility risk:** **High.** A drag-only carousel is unusable by
  keyboard and opaque to screen readers unless it is built as a real list
  first and decorated second.
- **Verdict: hold.** Attractive, but Selected Work currently has five projects
  and no photography. Revisit when there are images worth spinning, and only
  as an enhancement over a working list.

## 06 — Site

- **URL:** https://codepen.io/atzedent/pen/XWBKEXr
- **Author:** Matthias Hurrle (@atzedent)
- **Principle:** A single hand-written WebGL2 fragment shader filling the
  viewport. No scene graph, no library — one quad and a shader.
- **Technology:** Raw WebGL2 (`getContext("webgl2")`), Pug for the one-line
  markup. Notably, the author clamps device pixel ratio downward rather than
  using it raw.
- **External dependencies:** None. This is the point.
- **Possible role here:** The technical model for any future ambient/hero
  shader — the same result as 01 and 03 for a few kilobytes.
- **Mobile:** Viable precisely because of the DPR clamp.
- **Performance risk:** Medium, and controllable — it is our shader.
- **Accessibility risk:** Low, decorative.
- **Verdict: adopt the technique when we add a shader.** The DPR clamp is
  already encoded in `renderScale()` in `motion/utils/env.ts`.

## 07 — Golden Ratio

- **URL:** https://codepen.io/creativeocean/pen/wBoJbmJ
- **Author:** Tom Miller
- **Principle:** An animated golden-ratio construction — nested squares and
  quarter-circle arcs drawn in SVG, revealed and rotated in sequence, with a
  gradient veil for depth.
- **Technology:** Inline SVG (`viewBox="0 0 81 50"`, stroked paths and rects,
  a rotated `linearGradient`), animated in JavaScript.
- **External dependencies:** GSAP is very likely (the author is a GSAP
  regular); the effect itself does not require it.
- **Possible role here:** Section dividers, or generated project plates. It is
  the closest reference to the drawing style already used in
  `components/projects/ProjectVisual.astro`.
- **Mobile:** Excellent — SVG scales for free and the geometry is tiny.
- **Performance risk:** Low. Animating stroke and transform on a handful of
  SVG nodes is cheap.
- **Accessibility risk:** Low, decorative.
- **Verdict: adapt.** The best value-per-byte of the nine for us. A `drawn`
  reveal on the project plates is a natural next step and needs no library —
  `stroke-dashoffset` plus the Web Animations API is enough.

## 08 — Grid Run

- **URL:** https://codepen.io/atzedent/pen/LEbRoqy
- **Author:** Matthias Hurrle (@atzedent)
- **Principle:** A shader sketch wrapped in a live editing environment —
  canvas, editable source, an error pane, and toggles for view and resolution.
  The interesting part is the *harness*, not only the visual.
- **Technology:** WebGL shader plus a `<textarea>` editor re-compiling on
  input; explicit resolution and reset controls.
- **External dependencies:** None.
- **Possible role here:** **Lab, not decoration.** A page where a visitor can
  edit a shader is a far better argument for "creative technologist" than a
  shader they can only watch.
- **Mobile:** The canvas is fine; the code editor is not a phone experience.
  It would need a read-only preview on small screens.
- **Performance risk:** Medium. Recompiling on every keystroke needs debouncing.
- **Accessibility risk:** Medium — a `<textarea>` is at least a real form
  control, which is more than most shader toys manage.
- **Verdict: hold, high potential.** The strongest candidate for the first
  real Lab entry, well after v0.1.

## 09 — Fancy Business Card B

- **URL:** https://codepen.io/tofjadesign/pen/QwEEzmo
- **Author:** tofjadesign
- **Principle:** A single card as a self-contained composition — layered
  background, gradient-filled SVG accents, choreographed entrance.
- **Technology:** GSAP 3.12.5 from a CDN, Inter from Google Fonts, an SVG
  `linearGradient` referenced by fill.
- **External dependencies:** GSAP, Google Fonts.
- **Possible role here:** Project cards, or an "about" card.
- **Mobile:** Good — a card is naturally responsive.
- **Performance risk:** Low visually; GSAP is ~70 KB for what CSS and the Web
  Animations API already do here.
- **Accessibility risk:** Low.
- **Verdict: reference only.** Adopting it would mean adding GSAP for one
  entrance animation. The whole client-side JavaScript payload of this site is
  currently smaller than that library.

---

## Status after iteration 2

- **04 — adapted and shipped.** `motion/language/greetingMorph.ts` now has
  three tiers: reduced / baseline / enhanced. The enhanced tier applies an
  SVG alpha-threshold filter (`#gate-threshold`, defined in the gate) so the
  blurred glyphs fuse and separate like liquid. It is capability-gated on
  `CSS.supports('filter','url(#x)')` and `hardwareConcurrency >= 4`, and the
  filter is attached only for the ~400 ms of each morph, not for the holds —
  clean letterforms while a word is being read, and the most expensive effect
  on the first screen is bounded to the moments it is doing something. No code
  was copied; the principle was re-implemented.
- **07 — adapted and shipped.** `stroke-dashoffset` line drawing, used in
  exactly two places: the project plates and the closing stroke in Contact.
  Every drawable element carries `pathLength="1"`, which normalises paths,
  ellipses and rects to one unit so a single CSS rule drives all of them.
- **06 — technique already encoded** as `renderScale()`, still unused because
  no shader exists yet.
- **01, 02, 03, 05, 08, 09 — unchanged verdicts.** Nothing from them shipped.
  GSAP and Three.js are still absent: the entire client-side payload of this
  site is 15 KB, which is a fraction of either library.

## What this research changed

1. **The language morph** (04) — shipped in iteration 2, capability-gated,
   with the safe per-glyph morph as the baseline tier beneath it.
2. **DPR clamping** (06) — encoded as `renderScale()` before any shader
   exists, so the first shader cannot get it wrong.
3. **No GSAP in v0.1** (07, 09) — every motion in this build is Web Animations
   API or CSS. GSAP earns its place when a timeline gets genuinely hard to
   sequence by hand, not before.
4. **SVG line-drawing over canvas** (07) — the project plates are static SVG
   today and can be animated with `stroke-dashoffset` later at almost no cost.
5. **A shader playground belongs in the Lab** (08) — as content, not chrome.


---

## Reference 08 — decision: NOT implemented

<https://codepen.io/atzedent/pen/LEbRoqy>

Held back from v0.2 as a possible Lab-only treatment. Evaluated in Iteration 3
and **deliberately not implemented.**

The Lab's job is to make eight open questions legible and to get a reader into
the one that interests them. Its content is short, text-heavy, and its whole
argument is *this is a rough notebook, not a showcase*. A full-bleed generative
background on a lab note would work against every part of that: it would make
the least-finished pages the most decorated ones, and it would add a WebGL/
canvas payload to pages whose entire value is a few hundred words.

There is also no experiment it would actually illustrate. The technique is
attractive but arbitrary here — it would be spectacle attached to a page about
spatial reasoning, not a depiction of spatial reasoning.

The brief's own budget settles it: three signature moments, and evidence over
spectacle. Iteration 3 spent its complexity on case studies and the Lab
structure instead.

**Revisit if** an experiment appears whose subject *is* the technique — a
shader, raymarching or generative-visual note. Then the effect stops being
decoration and becomes the artefact, and the rules already written down for it
(lazy-load, capability gate, bounded DPR, pause when hidden, reduced-motion
fallback, readable without it) apply as stated.
