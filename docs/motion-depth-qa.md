# Motion depth — verification, budgets and guards

**Item:** W8 of [`motion-depth-plan.md`](motion-depth-plan.md) · **Baseline:** `eca3f17`, measured 2026-10-15 ·
**Gates the merge of W1–W7.**

The plan makes promises that a reviewer cannot check by looking: that no
element has two owners for `transform`, that nothing animates under calm, that
a phone never downloads the desktop scan, that the cursor-carried plate still
follows the hand. This document says how each promise is checked, what the
site measured **before** any depth work landed, and what still needs a person
and a real device.

---

## 1. Running it

```bash
npm install            # once: adds @playwright/test (devDependency only)
npm run build
npm run budget         # sizes + lint on dist/            ~2 s
npm run test:e2e       # desktop + phone, system Chrome   ~2 min
npm run lhci           # Lighthouse mobile, median of 3   ~7 min
npm run test:e2e:gpu   # headed, real GPU (opens a window) ~30 s
```

| Command | What it guards | Fails when |
| --- | --- | --- |
| `npm run budget` | §5.4 sizes, §1 rules 5–7, §5.1 triple gate, CSP promises | any cap or lint rule is broken |
| `npm run budget:self-test` | the checker itself | a seeded violation of any kind is *not* caught |
| `npm run test:e2e` | §11 automated list, W1–W7 acceptance | a regression, or (with `E2E_STRICT=1`) a planned feature that is missing |
| `npm run lhci` | §10 W8 Lighthouse numbers | perf < 95, a11y < 100, TBT > 50 ms, CLS > 0.01, LCP > 2.5 s *and* above baseline |
| `npm run test:e2e:gpu` | §5.5 / §7 / §11 real-GPU items | a depth script runs ≥ 50 ms under 6× throttle; text over the scan below AA |

Everything uses the **system Chrome** (`channel: 'chrome'`); no browser is
downloaded. The e2e suite serves `dist/` with `astro preview` on port 4618
(`E2E_PORT` overrides). Lighthouse serves `dist/` itself, gzipped, the way the
host does — `astro preview` sends everything uncompressed. Reports, traces and
diffs go to `artifacts/` (gitignored).

**Before integration** run the suite as is: tests for markup that has not
landed yet are *skipped* with `[pending Wn] …` in the report, and every
regression test runs. **On `feat/motion-depth` after integration**, run with
`E2E_STRICT=1`: a pending skip becomes a failure, because a planned feature
that is not there is a regression.

---

## 2. Baseline (pre-change, `eca3f17`)

### Sizes — `scripts/budget-baseline.json`

Gzip level 9, each file on its own. *CSS* is every inline `<style>` on the
page (Astro inlines all of it). *Initial JS* is the inline scripts plus the
static import closure of the page's module scripts — dynamic `import()`
chunks are not on the initial path.

| Page type | Pages | Inline CSS | Initial JS | HTML | Cap: CSS / JS growth |
| --- | ---: | ---: | ---: | ---: | --- |
| home `/<lang>/` | 6 | 7.29 KB | 9.16 KB | 18.1–18.6 KB | +5 / +2 KB |
| case study `/projects/*` | 36 | 6.10 KB | 5.08–5.37 KB | 10.5–11.8 KB | +3 / +2 KB |
| laby index | 6 | 6.14 KB | 5.08 KB | 15.5–15.9 KB | +3 / +2 KB |
| laby detail | 30 | 5.87 KB | 5.08 KB | 10.6–11.6 KB | +3 / +2 KB |
| lab index | 6 | 5.31 KB | 5.08 KB | 8.8–9.0 KB | +3 / +2 KB |
| lab note | 66 | 5.51 KB | 5.08 KB | 8.2–9.4 KB | +3 / +2 KB |
| gate `/` | 1 | 4.61 KB | 5.88 KB | 6.9 KB | +3 / +0.6 KB, no depth code |
| 404 | 1 | 4.25 KB | 2.97 KB | 6.8 KB | +3 / +0.6 KB, no depth code |

All `_astro/*.js`: **12.37 KB gz** in 18 files (cap: +11.1 KB, the sum of the
§5.4 table). The gate and 404 may grow by 0.6 KB only because `env.ts` lives
in a chunk they already load; they must never contain `depth-ready` or
`data-motion-toggle`. The plan's own figures check out: the homepage ships
9.16 KB gz of JS (plan: "about 9.5") in an 18.1 KB gz document (plan: 18.4).

### Lighthouse — `scripts/lighthouse-baseline.json`

Mobile (Moto G Power, slow 4G, simulated), median of 3.

| Page | Perf | A11y | LCP | TBT | CLS | LCP element |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/en/` | 96 | 100 | **2.56 s** | 0 ms | 0.000 | `.hero__aside > p.hero__intro` |
| `/en/projects/splatoo/` | 97 | 100 | 2.41 s | 0–57 ms | 0.000 | `p.project-page__subtitle` |
| `/en/projects/circus-movement/` | 97 | 100 | 2.40 s | 0–16 ms | 0.000 | `h1.project-page__title` |
| `/en/laby/` | 96 | 100 | **2.56 s** | 0–117 ms | 0.000 | `.labs-hero__body > p.lead` |
| `/en/lab/` | 97 | 100 | 2.41 s | 15–30 ms | 0.000 | `.lab-page__intro > p.lead` |
| `/404.html` | 99 | 100 | 2.10 s | 0 ms | 0.000 | `p.not-found__lead` |

### Long tasks, real GPU, 6× CPU throttle (homepage scroll)

Four runs on the pre-change site: none; 152, 65, 53 ms; 105, 58, 147, 237 ms;
331, 53, 66, 56, 60, 69 ms. Long Animation Frame attribution puts the time in
style, layout and paint as Selected Work rows pass under a still pointer
(`pointerenter` → preview plate draws in), plus one 99 ms rAF callback with no
source URL. None of it is script the depth work adds.

---

## 3. Findings that change how two gates read

These were found while measuring the baseline. Both are recorded here so the
gate stays meaningful instead of being red from day one.

1. **LCP is over 2.5 s today on two pages, and it is not the h1.** On a phone
   the homepage's LCP element is `.hero__intro`, inside the `[data-reveal]`
   aside; its 1.5 s render delay is the reveal. `/laby/` is the same story
   (`p.lead`). So `npm run lhci` passes LCP at ≤ 2.5 s **or** at ≤ 2 % over
   that page's baseline (`≈b` in the report). The depth work may not make it
   worse; fixing it is a separate decision. W3's "LCP element and time are
   unchanged" is exactly this check on `/en/`. Note for W3: `.hero__aside`
   carries `[data-parallax]` and is the phone LCP element — the pointer
   field must stay off it on touch (it already is: mouse only).
2. **"No long task over 50 ms" fails on the pre-change site** (above). The
   automated gate therefore holds the depth code to it exactly — no script
   from `tilt`, `mount`, `pointScan`, `gl`, `depthPhoto` or `heroScan` runs
   ≥ 50 ms, which is the plan's reason for the rule (shader compile and point
   upload split into short tasks) — and lists every page-wide long task on
   the result for the merge review. The device protocol (§6) is where
   whole-page smoothness is judged.

---

## 4. `scripts/check-budget.mjs`

Reads the built HTML, not the source: what matters is what reaches the
browser, and one line in a shared stylesheet is paid by all 152 pages.

| Rule id | Checks | Source |
| --- | --- | --- |
| `budget-css`, `budget-js` | per page against its own baseline (new pages: their type's max) | §5.4 |
| `chunk-cap` | `tilt` ≤ 1.3, `mount` ≤ 1.3, `pointScan`+`gl` ≤ 4.5, `depthPhoto` ≤ 2.0 KB gz | §5.4 |
| `lazy-on-initial` | any of those chunks statically imported by any page | §5.2, §5.4 |
| `total-js` | all `_astro/*.js` growth ≤ 11.1 KB gz | §5.4 |
| `scan-bin` | `*-desktop.bin` ≤ 70 KB, `*-mobile.bin` ≤ 28 KB, raw | §5.3 |
| `depth-css` | `src/styles/depth.css`, minified, ≤ 2.5 KB gz | §5.1 |
| `owner` | `data-depth` with `data-reveal(-lines)`, `data-magnetic`, `data-parallax`; `data-tilt` with the same; `data-lift` with `data-depth`/`data-parallax`; any of them on `.line__inner` | §1 rule 5 |
| `vocabulary` | `data-depth` ∈ rise, recede, drift, approach, window; `data-scrub` = rule | §5.1 |
| `forbidden-ancestor` | on `html`, `body`, `main`, `.wrap`, `.work__list`, `.project`, `.project__link` **and every ancestor of `.project__plate` / `.transition-cover` found on that page**: no depth/tilt/lift/parallax attribute, no inline or CSS `transform`, `translate`, `rotate`, `scale`, `perspective`, `filter`, `backdrop-filter`, `will-change` of those, `contain: paint/layout/strict/content`, `content-visibility` | §1 rule 6 |
| `triple-gate` | every `animation-timeline` inside `@supports (animation-timeline…)` + `@media (prefers-reduced-motion: no-preference)` + `:not([data-calm])` | §5.1 |
| `flatten` | a rule with `transform-style: preserve-3d` also setting opacity, overflow, filter, mask or clip-path | §1 rule 7 |
| `gate-js` | `depth-ready` / `data-motion-toggle` in the gate's or 404's initial JS | §3.15 |
| `scan-caption` | `.hero__scan-cap` without `hidden`, `.hero__scan` without `aria-hidden="true"` | §3.1, §7 |
| `csp` | `eval(`, `new Function(`, `blob:`, `new Worker(` in any chunk; a script from another origin | §5.3 |

A **warning** (never fails) is printed for `.press` on a forbidden ancestor:
the plan puts `.press` on `.project__link`, which is an ancestor of the fixed
desktop plate. Its `:active { scale }` must be confined to touch
(`(hover: none)`), or a desktop mouse-down rescopes the plate for a frame.

`npm run budget:self-test` builds a small site in a temp directory, measures
it, then breaks it 22 ways (every rule id above, several shapes of each) and
requires each to fail — and the clean site to pass.

**Baselines are only ever written from the pre-change commit.** Rewriting
them after depth work lands would make the caps measure nothing:

```bash
git checkout eca3f17 && npm run build
node scripts/check-budget.mjs --write-baseline
node scripts/check-lighthouse.mjs --write-baseline
```

---

## 5. The e2e suite — `tests/e2e/`

| File | Covers (plan §11 and acceptance) |
| --- | --- |
| `motion.spec.ts` | **No-JS** on every page type (content at full opacity, no canvas, no leaked caption) · **calm**, both via OS reduce and via stored `data-calm`: no `animation-name` on depth targets, no scroll-driven animation anywhere, zero rAF 2 s after load, no live GL context, the scan as one static frame, a project row as a plain link · calm **before first paint** (the state of `<html>` when `<body>` first exists) and across reload · **idle**: zero rAF 3 s after load and 2 s after scrolling stops · **reading band**: every homepage section head at identity (transform, translate, scale, rotate, opacity, ancestors and depth descendants) with its top at 70 %, 50 % and 30 %; anchors `#work`, `#hero`, `#contact` land on identity · **toggles**: two real buttons, ≥ 44 px, keyboard, persist, pressed + disabled under OS reduce · **loading**: touch never requests `tilt.*` or `*-desktop.bin`; a fine pointer gets `tilt.*`; gate and 404 load no depth chunk · **hero**: 12 rules, the caption never shown without a drawn frame and linking to a real page; phone stage 11 rem, 4 rules, no shift · **footer** bookend 12 / 4 · **layout**: no horizontal overflow at 360 px, scrolled top to bottom, on every page type; CLS ≤ 0.01 through load and a full scroll · pixel-sampled AA contrast of statement and intro |
| `regressions.spec.ts` | the cursor-carried plate follows the pointer **and stays fixed to the viewport after a scroll** (the containing-block regression) · keyboard-anchored plate does not lean · the plate transition for **pointer, touch and keyboard in all 5 families**, landing with the cover painted before first frame · Escape, Enter and Space skip · gate → homepage hand-over · 404 status, localisation, no depth markup · Splatoo click-to-load: sandbox string, focus, poster gone, no live GL context, `figure[data-loaded]` with no transform anywhere inside · the cursor field: fixed, inert, on `<body>`, full viewport after scrolling · hero pointer parallax still moves its layers at full opacity · **the transition's first frame** for every family and every input |
| `visual.spec.ts` | desktop hero at scroll 0 (new layers hidden) and every phone plate under calm — against images taken from the pre-change site |
| `gpu.spec.ts` | headed, real GPU: depth scripts under 6× throttle, contrast over the drawn scan, the scan's loop stopping and its context released on calm |

### Pixel references — `tests/e2e/__screenshots__/`

Taken from `eca3f17` on Windows / Chrome. They are what "pixel-identical to
today" means for W3 and W4: the hero at scroll 0, the six phone plates under
calm, and for each of the five plate families the plate at rest and the
transition's **first frame** (all animations frozen at 0) for pointer, touch
and keyboard. They are platform-specific (`-desktop`, `-mobile` suffixes);
a Linux CI needs its own set, taken from the same commit.

`maxDiffPixels` is 0 everywhere except the cursor-carried plate, which gets 24:
a layer that has just finished a scale/rotate transition is occasionally
re-rastered a few anti-aliased pixels differently (9 px in 1 of 75 runs). A
misregistered lift, or a 40 % base accent showing, changes hundreds.

---

## 6. Real devices (manual, blocking for merge)

Lighthouse and headless Chrome rasterise in software; the scan never runs
there. These are the only checks of what the visitor actually gets.

| # | Device | Procedure | Pass |
| --- | --- | --- | --- |
| D1 | Mid-range Android (Moto G / Galaxy A), Chrome, remote DevTools | Performance trace while flicking the homepage top to bottom twice | 60 fps in the scrolled sections; no frame > 50 ms whose bottom-up shows depth code |
| D2 | same | DevTools → Layers, at the hero, Selected Work, About, Contact | ≤ 12 animated layers per viewport |
| D3 | same | 10 minutes of continuous scrolling (thermal soak) | the scan never freezes into its snapshot (governor) |
| D4 | iPhone 12 class, Safari 26, Web Inspector | D1 + D2 | same |
| D5 | same, Low Power Mode on | scroll the hero, read the governor state | 30 Hz does **not** trigger degrade |
| D6 | same | background the tab 30 s, return | the scan comes back (context restore), no blank canvas |
| D7 | iPhone with iOS < 26, and Firefox desktop | whole homepage, one case study, `/laby/` | today's site exactly; nothing stuck in a "from" state |
| D8 | 1440p / retina laptop, Chrome | hero at rest and while scrolling | the rules and name are crisp at rest (no raster blur); scan cost acceptable at renderScale 1.5 |
| D9 | any phone and any desktop | toggle Calm in the nav, reload, navigate, toggle back | applied before paint, persists, label says the next page takes full effect |
| D10 | a browser without `::details-content` (Chrome < 131, Safari < 18.4, Firefox < 143) | open the language menu in the desktop nav | the Calm toggle appears beside EN inside the menu and is reachable by keyboard |

### Merge record

One row per merge into `feat/motion-depth`. From the first merge on, e2e runs
with `E2E_STRICT=1`.

| Date | Commit | budget | lhci | e2e | gpu | D1–D9 | By |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-15 | `eca3f17` (baseline) | ✓ | ✓ (LCP ≈ b on `/en/`, `/en/laby/`) | ✓ 125 passed, 20 pending (not strict) | ✓ 1 passed, 2 pending | — | W8 |
| 2026-10-15 | `9d86518` stage 1 (W1 W2 W4 W6 W8) | ✓ (home JS cap 2.6, see check-budget) | — | ✓ 126 passed, 13 pending | — | — | lead |
| 2026-10-17 | stage 2 (W3 W5 W7) + integration fixes | ✓ (other page types 2.1, see check-budget) | 5/6 ✓ — home 2.56 ≈ b, splatoo 2.41, circus 2.41, lab 2.41, 404 2.10; perf 96–99, a11y 100, CLS 0. `/en/laby/` TBT: see note 1 | ✓ strict, 145 passed | not run (no GPU runner) | pending — Denis's devices | lead |

**Note 1 — `/en/laby/` TBT.** The gate reads 57–69 ms in a 3-run median on
some runs and 0 on others (a 7-run median was 0). The cause is one long task
at the reveal (`enterReveal`, ~1.66 s simulated) that sits on the FCP
boundary, so the simulation counts it or not. The baseline has the same task:
measured 2026-10-17 against `eca3f17` with three Lighthouse runs each, longest
task 144–183 ms and TBT 0 / 0 / 94 before, 166–256 ms and TBT 0 / 0 / 58
after. Not a regression of this work; recorded rather than gated around.

**Note 2 — first TCP window.** Measured with Vercel's real compression
(brotli quality 3: it matches the live byte counts exactly) plus ~1 KB of
response headers, 140 of 152 pages fitted the first 14.6 KB window before this
work. After it, 65 case-study and laby pages exceed it by 0.6–1.3 KB on a
first visit, which can cost those pages one round trip before the reveal.
What was done about it: the next-project ghost plate was removed (a 17 KB SVG
per case study), and depth.css is linked rather than inlined on every page
except the homepage (cached across pages, preloaded, applied before the
reveal). The rest is the cost of the Calm toggles, the footer bookend, the
dioramas and the photo frames. The homepage inlines depth.css and is not
given a prefetch: in Lighthouse any extra request before LCP moved it from
2.56 s to 2.71 s, even at idle priority.

