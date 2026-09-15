# Architecture decisions

Each entry is a decision that could reasonably have gone the other way.

## Astro, static output, no UI framework

Every page here is content that is identical for every visitor. There is no
session, no personalisation, no data fetching. That makes six prerendered HTML
documents the correct output, and it means the interactive parts can be small,
specific modules instead of a framework runtime.

The whole client-side payload is currently a few kilobytes gzipped, spread
across per-component chunks that only load on the page that uses them. For
comparison, GSAP alone — used by two of the nine motion references — is
roughly an order of magnitude larger than everything this site ships.

An interactive island (Svelte, Preact) remains available if a component
genuinely needs reactive state. Nothing so far has.

## Manual `[lang]` routing rather than Astro's i18n integration

Astro's built-in i18n routing assumes the root is a locale or a redirect.
Here the root is a **fullscreen experience**, which is a different thing from
both. Rolling the routing by hand is about twenty lines — a `LOCALES` registry
and one `getStaticPaths` — and it keeps `/` free to be what the brief asks for.

## The dictionary is a type, not a convention

`src/i18n/dictionary.ts` declares `Dictionary`, and each locale file is typed
as it. A missing key is a build error rather than an empty string discovered
in production by a Turkish reader. `ProjectStatus` and `CurrentlyKind` are
imported into that interface, so adding a project status the translations do
not cover also fails the build.

Locales additionally carry `quality: 'reviewed' | 'working'`. The three
working locales say so in their own footer instead of quietly presenting draft
copy as final.

## Content split: chrome in `i18n/`, entities in `data/`

Two homes, one rule:

- **`i18n/translations/`** — site chrome and long-form narrative: navigation,
  hero, about, services, contact, footer.
- **`data/`** — content entities: projects, experiments, currently. Their copy
  is inline, per-locale, via `LocalizedText`.

The reason is editing friction. Adding a project should mean touching one
file, not seven. `LocalizedText` accepts either a plain string (for things
that do not translate, like `Pravo365`) or a per-locale map that falls back to
English, so a half-translated entry still renders.

## The transition is a real navigation, not a router

The brief's hard requirement was that choosing a language must not feel like
"click → blank → new page". The obvious solution is a client-side router. This
build does it without one:

1. Locale pages are **prefetched on hover/focus** (`prefetch` in
   `astro.config.mjs`), so the document is usually already cached.
2. On click, the chosen label **flies to the centre of the screen and scales
   to exactly the size the next page will paint it at** — measured from the
   cover label's computed `font-size`, not guessed.
3. Navigation is deferred until an opaque cover owns the viewport.
4. The destination sets `data-entering` from an **inline script in `<head>`**,
   before first paint, so its cover is already opaque. There is no white flash
   to hide.
5. The cover retracts, the hero reveals.

The cost of this approach is one shared component (`TransitionCover.astro`)
and one sessionStorage handoff. The benefit is that there is no router to
maintain, no history handling, no double-render, and every page remains a
plain document that works on its own.

**Timers, not animation promises.** Both halves race
`Animation.finished` against a wall clock. `finished` never settles while the
document timeline is frozen — a backgrounded tab, an occluded window, some
embedded webviews — and without the race a visitor who switches tabs
mid-transition returns to a gate that has swallowed their click. This was
found in testing, not reasoned about in advance.

## Language memory without auto-redirect

The chosen locale is stored in `localStorage` and the gate marks it with a
signal-coloured dot. It does **not** redirect.

An automatic redirect makes the entry experience — the single most
distinctive thing on this site — unreachable on every visit after the first,
and it breaks the back button in a way visitors experience as the site
fighting them. One saved click is not worth either.

## Progressive enhancement is structural, not decorative

The inline boot script adds `js` to `<html>`. Every hidden-until-revealed
state in `styles/motion.css` is written as `.js [data-reveal] { opacity: 0 }`.

If a script fails to load, is blocked, or throws, the page is fully visible
rather than fully blank. This was verified by removing the class at runtime
and confirming the content renders. The gate degrades to a plain, crawlable
index of six language links.

There is also a dead man's switch: the inline snippet removes `data-entering`
after 2.6 s, and the gate reveals its chooser after 5 s regardless of what the
animation is doing.

## One accent, plus one for the Lab

`--c-signal` (vermilion) carries work, links and emphasis. `--c-lab` (cold
mint) appears only in the Lab section. Two accents used for two distinct kinds
of content is a system; five accents would be decoration.

The palette is a single committed dark theme rather than a light/dark pair.
Adding a light theme later is a token swap in `tokens.css`, since no component
hard-codes a colour.

## Motion timing lives in CSS, and reduced motion is one variable

Durations are `calc(<time> * var(--motion-mult))`. A single
`prefers-reduced-motion` block sets the multiplier to `0.012` and the entire
CSS motion layer collapses at once — no chance of remembering it in four
components and forgetting it in the fifth. It is deliberately not `0`, so
`transitionend` and `finish` events still fire for the code paths that depend
on them.

JavaScript modules check `prefersReducedMotion()` separately and take a
different path rather than a faster one: the greeting morph jumps to its
final state, the transition becomes a short crossfade, the pointer field and
the magnetic controls do not initialise at all.

## Fonts: self-hosted, two subsets, one preload

Inter Tight and JetBrains Mono, both OFL, copied out of `@fontsource-variable`
into `public/assets/fonts/` at setup. Only `latin` and `latin-ext` ship.

`latin-ext` is not optional: `ć` (Mitrović), `ř`/`ě` (Czech), `ş`/`ğ`
(Turkish) and `č`/`š` (Slovak, Serbian) all live there. Without it, three of
six locales render in a fallback face.

Only the `latin` display cut is preloaded. Preloading `latin-ext` as well
would put roughly 90 KB more into the critical path to save a few milliseconds
on one diacritic. A metric-matched `Inter Tight Fallback` face with
`size-adjust` and ascent/descent overrides keeps the swap from visibly
reflowing a heading set at up to 15 rem.

## Performance rules that are enforced by code, not by intention

- `createLoop()` in `motion/utils/env.ts` is the only way a rAF loop is
  started. It stops on `visibilitychange` and when the tick returns `false`,
  which every loop uses to stop once its eased value has settled.
- `renderScale()` clamps device pixel ratio to 1.75. It exists before any
  shader does, so the first shader cannot get it wrong.
- The page grain is a static SVG data-URI painted once by CSS, not an animated
  canvas. Texture for zero frames per second.
- Only `transform`, `opacity`, `filter` and `clip-path` are animated. The
  project preview plate keeps `transform` for the eased pointer position and
  uses the separate `scale` and `rotate` properties for its transition, so CSS
  never fights the JavaScript loop over the same property.
- `will-change` is released in the `.is-revealed` state. A page of permanently
  promoted layers is a real memory cost.

## Desktop and touch are two designs, not one design and a media query

Selected Work is the clearest case. On a fine pointer it is a list of
oversized typographic rows with the hovered project's plate following the
cursor. On touch, the same markup is laid out as cards **with the plate inline
and visible** — the touch visitor sees the artwork, they just do not chase it
with a finger they cannot hover with.

Both layouts share one `<a>`, so the link, its accessible name and its
keyboard behaviour are identical. Keyboard focus gets a third treatment: the
plate anchors to the row rather than to a cursor that is not there.

The navigation has no hamburger. Four short words in a monospaced row fit on a
320 px screen, so mobile gets the same four links one row lower instead of a
menu button, a focus trap and an extra tap.

## Iteration 2 decisions

### The type scale is organised by role, not by heading level

v0.1 sized things by what tag they were, and ended up with the hero statement,
every section heading and every project title within 4 px of each other at the
same weight. `tokens.css` now defines `--t-gate`, `--t-mega`, `--t-statement`,
`--t-project`, `--t-display` and `--t-section`, ordered by how loud that role
is allowed to be. Section headings got *quieter* so that project titles could
be the loudest thing after the hero, which is what the brief asks for.

### Weight is a rule

`--fw-heavy` for names and proper nouns, `--fw-light` for sentences and
questions, expressed as `.is-name` and `.is-say`. "DENIS MITROVIĆ" is heavy;
"I make ideas real." is light and nearly as large. That single contrast does
more identity work than any effect on the page, and it costs nothing because
both faces are variable.

### The masked line had been eating diacritics

`.line { overflow: hidden }` drives every line reveal. At `line-height: 0.86`
the glyph box overflows its content box by roughly 0.18em at the top, so the
mask was clipping the acute accent off Ć — the site was rendering the author's
name as "MITROVIC". The mask is now grown on both sides and pulled back with
negative margins, which expands what is painted without moving anything in
layout. Three of six locales are full of diacritics; this was not cosmetic.

### The transition is panels, not a wipe

Six columns that close from the centre outwards and open the same way on the
destination. It animates nothing but `transform`, so it is cheaper than the
`clip-path` wipe it replaced as well as more distinctive. The choreography
lives in `motion/language/panels.ts` because both halves have to agree on it.

### The threshold morph is capability-gated, and temporary

The enhanced greeting morph attaches an SVG alpha-threshold filter so blurred
glyphs fuse like liquid. Two things keep it from being a liability: it is
gated on `CSS.supports('filter','url(#x)')` plus `hardwareConcurrency >= 4`,
and the filter is attached only for the ~400 ms of each morph, never during
the holds. Clean letterforms while a word is being read, and the most
expensive effect on the first screen exists only while it is doing something.

### The hero readout is real data

The right-hand column counts projects, live projects and experiments from
`src/data`. Inventing plausible "technical-looking" text — coordinates, build
hashes — would be the kind of detail that makes a portfolio feel dishonest to
anyone who looks closely.

### The Open Graph image is generated, not hand-maintained

`src/assets/og.svg` is the editable source; `npm run og` rasterises it to PNG
with `sharp` (a devDependency — nothing in that pipeline ships). It is set in
a system grotesque rather than Inter Tight, because the rasteriser runs
outside the browser where the self-hosted webfont does not exist, and a source
file that is honest about that beats a PNG that silently falls back.

### QA method

The in-app browser pane composites only when a capture is requested, so CSS
transitions barely advance and screenshots taken during a reveal catch it
mid-flight; `position: sticky` layers also composite at the wrong offset.
Layout facts therefore come from `getBoundingClientRect` / `getComputedStyle`
sweeps, and Playwright is used for the saved screenshots in
`artifacts/screenshots/`. Its console log is also what surfaced the missing
favicon.

## Known gaps

- The production domain is not decided yet. It is set with the `SITE_URL`
  env variable (see `.env.example` and `src/config/site-url.mjs`); on Vercel,
  `VERCEL_PROJECT_PRODUCTION_URL` is a stop-gap until a custom domain exists.
  Without a URL, canonical, `og:url`, `hreflang` and `sitemap.xml` are omitted.
- The Open Graph image is now a real PNG, but it is set in a fallback
  grotesque rather than in Inter Tight. Rendering it through a headless
  browser would fix that if it ever matters.
- Contact details are `null` by design until provided.
- Three of the five projects have no case study yet, and render the short
  project page. Add a `detail` block to promote one.
- Case-study prose exists in EN, CS and SK. ES, SR and TR fall back to English
  with a visible note; that note is the honest interim, not the destination.
