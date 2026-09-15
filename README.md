# Denis Mitrović — personal site / creative lab

The site brand is the person: `Denis Mitrović`, with `Ideas, made real.` as a
secondary claim. Project labs for schools (`/cs/laby/`) are one of the
activities on the site, not a separate brand.

A statically generated, six-language personal site built so that the site
itself reads as one of the projects: an entry gate instead of a homepage, one
continuous transition into the chosen language, and a motion system with an
explicit hierarchy.

**Stack:** Astro 5 · TypeScript (strict) · Payload CMS 3 (headless) ·
semantic HTML · modern CSS · vanilla TS for interaction. No UI framework,
no animation library.

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:4321>.

### Payload CMS

Payload is the canonical content source **when it is running**. With it up,
publishing a project in the admin gives that project its own public route in
every locale on the next build, with no source-code change. With it down, the
site builds from the local TypeScript files in `src/data/` instead — routes
and content both, never a mix of the two.

To enable it:

```bash
cd cms
npm install
cp .env.example .env          # edit PAYLOAD_SECRET
npm run dev                   # starts on port 3000
npm run content:import        # case studies + lab notes
npm run content:movement      # circus / snowboard / web work
```

Then **restart** the Astro dev server — the source is probed once per process,
so a CMS started afterwards is not picked up until Astro restarts. Astro logs
which source it resolved:

```
[CMS] Source: Payload
[CMS] Payload unavailable — using local fallback data
```

See [`docs/payload-architecture.md`](docs/payload-architecture.md) for how the
source is decided and [`docs/payload-development.md`](docs/payload-development.md)
for the create-a-project-in-the-admin test.

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server on port 4321 |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run check` | `astro check` — TypeScript + template diagnostics |
| `npm run og` | Rasterise `src/assets/og*.svg` to the Open Graph PNGs |
| `cd cms && npm run dev` | Payload CMS admin on port 3000 |
| `npm run cms:snapshot-fallback` | Payload → `src/data/generated` (one way) |
| `cd cms && npm run content:import` | Load case studies + lab notes |
| `cd cms && npm run media:import` | Load evidence images + alt text |
| `cd cms && npm run build` | Production build of CMS |

---

## Where to change things

| I want to change… | Edit this |
| --- | --- |
| Brand name, tagline, my name, role, contact, social links | `src/config/site.ts` |
| Production domain (canonical, og:url, hreflang, sitemap) | `SITE_URL` env — see `.env.example` and `src/config/site-url.mjs` |
| Project labs for schools (Czech) | `src/data/labs.ts` |
| Which languages exist, their routes and labels | `src/i18n/locales.ts` |
| UI copy, hero, about, services, contact wording | `src/i18n/translations/<code>.ts` |
| Projects in Selected Work | CMS admin (canonical) — `src/data/generated/` is a generated fallback |
| A project case study | the project's fields in the CMS admin |
| The Open Graph images | `src/assets/og.svg` (site), `src/assets/og-laby.svg` (labs), then `npm run og` |
| Lab experiments and open questions | CMS admin — `src/data/generated/` is a generated fallback |
| What I am currently doing | CMS admin — `src/data/generated/` is a generated fallback |
| Colour, type scale, spacing, motion timing | `src/styles/tokens.css` |
| Animations | `src/motion/**` |

### Adding a language

1. Add an entry to `LOCALES` in `src/i18n/locales.ts`.
2. Create `src/i18n/translations/<code>.ts` typed as `Dictionary`.
3. Register it in the `dictionaries` map in `src/i18n/index.ts`.
4. Optionally add the language to the `LocalizedText` maps in `src/data/*`.

The route, the `<html lang>`, the `hreflang` set, the gate option and the
in-site switcher all follow automatically. TypeScript will refuse to build
until the dictionary is complete, so a half-added language cannot ship.

### Adding a project

Create it in the Payload admin and hit **Publish**, then rebuild. It gets a
page at `/[lang]/projects/[slug]/` in every locale automatically — the route
list comes from the CMS, so no file needs editing. Drafts get no route.

`visual` picks which generated plate is drawn — no image files required — and
leaving the external URL empty omits the outbound link rather than rendering a
dead one. Fill in the case-study fields to turn the page into a full case
study; without them it renders the short model. `writtenLocales` lists the
locales whose prose actually exists, and any locale outside that list is shown
the English text with a visible note saying so.

To make it survive a CMS outage too, run `npm run cms:snapshot-fallback` — the
fallback files are generated from Payload and should never be edited by hand.

---

## Architecture in one screen

```
src/
  config/site.ts          brand + identity, the only file to edit for rebranding
  i18n/
    locales.ts            locale registry — routes, labels, greetings
    dictionary.ts         the shape every locale must satisfy
    translations/*.ts     one dictionary per locale
    memory.ts             client-side language memory (no auto-redirect)
    text.ts               LocalizedText helper for data files
  data/                   types + helpers
    generated/            GENERATED fallback content — do not edit
  lib/cms/
    source.ts             resolves 'payload' | 'fallback' ONCE per build
    routes.ts             which slugs get a static page
    client.ts             REST client, forces _status=published
    normalize.ts          Payload docs -> the view models the site already uses
  motion/
    utils/env.ts          reduced motion, pointer type, rAF loops, DPR clamp
    language/             greetingMorph, enterTransition, enterReveal, panels
    hero/pointerField.ts  desktop pointer drift
    projects/             pointer-following project preview
    ambient/README.md     reserved slot + the rules any ambient module must meet
    scrollReveal.ts       IntersectionObserver reveals
    magnetic.ts           magnetic controls
  components/             one folder per section
  layouts/BaseLayout.astro  head, SEO, hreflang, the pre-paint boot script
  pages/
    index.astro                    / — the language gate
    [lang]/index.astro             /en/ /cs/ /sk/ /es/ /sr/ /tr/
    [lang]/projects/[slug].astro   30 project pages (6 locales x 5 projects)
    [lang]/lab/index.astro         the Lab index, one per locale
    [lang]/lab/[slug].astro        66 lab notes (6 locales x 11 experiments)
    [lang]/laby/index.astro        /cs/laby/ — project labs for schools (Czech only)
    [lang]/laby/[slug].astro       /cs/laby/<lab>/ — five lab detail pages
  styles/                 tokens, reset, typography, motion, global
public/assets/fonts/      self-hosted variable fonts
integrations/
  media-snapshot.mjs      copies published CMS uploads into dist/media/ at build
  sitemap.mjs             writes sitemap.xml + robots.txt when SITE_URL is known
scripts/
  render-pointcloud.py    renders a .ply scan to PNG (how the scan evidence was made)
docs/                     architecture, content model, motion references, visual audit
artifacts/
  evidence-raw/           untouched captures + originals
  evidence-ready/         optimised derivatives that get imported into Payload
  screenshots/            QA captures

cms/                        Payload CMS (separate Next.js app)
  src/
    payload.config.ts       central config — collections, globals, localization
    collections/            Users, Projects, Experiments, Media
    globals/                Currently, SiteSettings
    seed/index.ts           RETIRED — refuses; see payload-development.md
    content/                the authored case studies + lab notes
    test/fixtures/          TEST ONLY — route-policy fixtures, never production
    app/(payload)/          Next.js routes for admin + REST API
  data/                     SQLite database (gitignored)
  media/                    uploaded files (gitignored)
```

Content and CMS docs: [`docs/content-audit.md`](docs/content-audit.md),
[`docs/assets-found.md`](docs/assets-found.md) (what real evidence exists and where it came from),
[`docs/assets-needed.md`](docs/assets-needed.md) (**what to shoot next**),
[`docs/diagram-style.md`](docs/diagram-style.md),
[`docs/iteration-5-restructure.md`](docs/iteration-5-restructure.md) (what moved into the Lab and how to undo it),
[`docs/iteration-5.1-movement.md`](docs/iteration-5.1-movement.md) (movement content, fallback snapshot),
[`docs/web-projects-review.md`](docs/web-projects-review.md) (client sites awaiting approval),
[`docs/localization-status.md`](docs/localization-status.md),
[`docs/payload-architecture.md`](docs/payload-architecture.md) and
[`docs/payload-development.md`](docs/payload-development.md).

See [`docs/architecture.md`](docs/architecture.md) for the reasoning,
[`docs/content-model.md`](docs/content-model.md) for where copy lives, and
[`docs/motion-references.md`](docs/motion-references.md) for the CodePen
research and what was taken from it.

---

## Signature moments

Three, and no more (`docs/visual-audit.md` explains why the budget matters):

1. **The greeting morph** on `/` — three tiers, from a plain jump under
   reduced motion up to an SVG alpha-threshold "liquid" morph where the device
   can afford it.
2. **The language transition** — six panels close from the centre outwards
   over the gate and open again on the destination, across a real document
   navigation.
3. **Selected Work** — oversized rows with a pointer-following plate on
   desktop, inline plates on touch.

Plus one recurring motif: `stroke-dashoffset` line drawing, used on the
project plates and on the closing stroke in Contact. Twice, deliberately.

## Motion hierarchy

Not everything moves, and the things that move do not all move equally.

- **Level 1 — signature.** The greeting morph, the language transition, the
  hero reveal. Allowed to be theatrical. Each is skippable.
- **Level 2 — interaction.** Project hover/preview, navigation state.
- **Level 3 — micro.** Links, buttons, scroll reveals. Barely noticeable.

Under `prefers-reduced-motion: reduce`, `--motion-mult` in `tokens.css` drops
to near zero, which collapses the entire CSS motion layer at once, and every
JavaScript module checks `prefersReducedMotion()` before doing anything.

## Non-negotiables

- The site works without JavaScript. All hidden-until-revealed states are
  gated behind `html.js`; if the scripts never load, everything is visible.
- No invented facts. A `null` contact field in `src/config/site.ts` renders an
  honest note instead of a plausible-looking address, and an unknown production
  domain omits canonical/hreflang/sitemap instead of guessing one.
  No client, metric, award or partnership appears anywhere unless it was
  given. Image `alt` text is never generated for an image nobody has seen.
- Content that has not been translated says so, rather than serving English
  silently. See [`docs/localization-status.md`](docs/localization-status.md).
- Evidence is real or absent. Every image on a project page is an actual
  artefact — a live product screenshot, a render of a real scan, or a diagram
  drawn from that project's own documentation. Where nothing exists, the page
  shows a generated plate and says nothing, rather than inventing a mockup.
- The built site carries its own images. `dist/` contains zero references to
  the CMS origin, so nothing breaks when Payload is offline.
- Touch is not a degraded desktop. Anything that depends on hover has a
  separate touch layout, never a hover effect a finger cannot trigger.
- No permanent `requestAnimationFrame` loop. Loops stop when settled, when
  off-screen, and when the tab is hidden.
