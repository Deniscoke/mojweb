# Payload CMS — Development

## First-time setup

```bash
cd cms
npm install
cp .env.example .env      # then set a real PAYLOAD_SECRET
npm run dev               # http://localhost:3000/admin
```

Create the admin user on first launch, then import the existing content:

```bash
cd cms && npm run seed
```

The seed is idempotent — it matches projects by `slug` and experiments by
`identifier`, so a second run updates rather than duplicates.

Then load the Iteration 3 case studies and lab notes:

```bash
cd cms && npm run content:import
```

### ⚠️ `npm run seed` is retired

It wrote `src/data` **into** Payload. Since Iteration 5.1 the flow is the
other way (see *Fallback snapshot* below), so running both would form a loop
that loses information. The command now refuses and points at the right one.
Bootstrapping a genuinely empty database needs
`npm run seed -- --force-bootstrap`.

### Fallback snapshot — Payload → `src/data/generated`

```bash
npm run cms:snapshot-fallback
```

Run it from the repo root, with Payload running, **after** any content change
you want reflected in the CMS-off build. It writes
`src/data/generated/{projects,experiments,currently}.data.ts`, each with a
`DO NOT EDIT MANUALLY` banner.

One way only. Drafts are excluded. Media binaries are not captured — a
fallback build renders no evidence images.

Verify parity after running it:

```bash
npm run build
```

with Payload up, then again with it down: both should report the same page
count. They currently do — 109 each.

### Content import scripts

| Command | Writes |
| --- | --- |
| `npm run content:import` | case studies + lab notes |
| `npm run content:movement` | circus / snowboard / web work |
| `npm run content:titles` | every project title, all six locales |
| `npm run restructure` | Selected Work arrangement |

### Seed vs. content import

Two scripts write content, and the difference matters.

| | `npm run seed` | `npm run content:import` |
| --- | --- | --- |
| Source | `src/data/*.ts` (fallback files) | `cms/src/content/*.ts` (authored) |
| Purpose | bootstrap an empty database | the real case studies and lab notes |
| On an existing record | structure and short fields only | rewrites the prose |

**The seed deliberately does not overwrite case-study prose or experiment
slugs on records that already exist.** Payload is canonical, its content is
richer than the fallback files, and an earlier version of the seed silently
reverted authored writing on every run. It now refreshes only structure,
and says so in its output.

Ordering on a fresh database: `seed` first (it creates the records), then
`content:import` (it fills them in). After that, either can be re-run in any
order without losing anything.

## Everyday loop

Two servers, two terminals:

```bash
cd cms && npm run dev
```

```bash
npm run dev
```

Astro probes `http://localhost:3000` once per build/dev-start. Because that
answer is cached for the process, **starting Payload after Astro does not
switch the running Astro server over to it** — restart Astro to re-probe.

Check which source you got from the first lines of Astro's output:

```
[CMS] Source: Payload
[CMS] Payload unavailable — using local fallback data
```

## THE test that matters

This is the proof that the CMS is genuinely canonical rather than decorative.
Run it after any change to the source-resolution or route-generation code.

1. Start Payload: `cd cms && npm run dev`
2. Open <http://localhost:3000/admin> → **Projects** → **Create New**
3. Fill in `title` and `slug` (e.g. `My New Thing` / `my-new-thing`)
4. Click **Publish** — not Save Draft
5. **Do not touch `src/data/projects.ts`**
6. Build the site: `npm run build`

Expected:

```
[CMS] Source: Payload
  ├─ /en/projects/my-new-thing/index.html
  ├─ /cs/projects/my-new-thing/index.html
  ...one per locale
```

If the route appears, the integration is working. If it does not, route
generation has fallen back to the local files and
`src/lib/cms/routes.ts` is the place to look.

Then repeat with **Save Draft** instead of Publish: the draft must produce
**no** route and must not appear in Selected Work.

The same policy governs the Lab. Create an experiment, give it a slug and
something in *What happened*, publish it, rebuild — `/[lang]/lab/<slug>/`
appears in all six locales. An experiment with no written log deliberately
gets **no** page and stays as an entry on the Lab index instead, so the site
never generates six near-empty documents for a one-line note.

### Scripted version

The same two documents can be created and cleaned up without the admin UI:

```bash
cd cms && npm run test:cms-fixtures:up
```

Creates `cms-route-test` (published) and `cms-draft-test` (draft). Build the
site, verify `dist/en/projects/cms-route-test/` exists and no
`cms-draft-test` directory does, then:

```bash
cd cms && npm run test:cms-fixtures:down
```

**Always run `test:cms-fixtures:down`.** These are placeholder documents, not
portfolio content, and must never reach a public build.

### Proving content (not just routes) came from Payload

Seeded CMS content is identical to the local files, so matching output proves
nothing on its own. Write a sentinel into the CMS only:

```bash
cd cms && npm run test:cms-marker:set     # sets pravo365 shortDescription (en)
```

```bash
npm run build
```

```bash
grep -rl "PAYLOAD SOURCE VERIFICATION" dist
```

The string must appear in `dist/en/index.html` and
`dist/en/projects/pravo365/index.html` while `src/data/projects.ts` still
holds the original sentence. Then restore:

```bash
cd cms && npm run test:cms-marker:reset
```

## Adding project media

Written for someone who does not use the CMS every day.

1. Start Payload (`cd cms && npm run dev`) and open
   <http://localhost:3000/admin>.
2. In the sidebar choose **Media**, then **Create New**.
3. Drop in the file (image, video, SVG or PDF).
4. Set **Kind** — this decides how the page frames it:
   - *Screenshot* / *Photo* — shown edge to edge
   - *Diagram* — given padding and a light background so it stays readable
   - *Video* — rendered with player controls
5. Fill in **Alt**. Describe what is actually visible, as you would to
   someone who cannot see it. Not the filename, not "image", not "screenshot
   of the app". If you leave it empty the image is hidden from screen readers
   rather than announced badly — that is deliberate, but a real description is
   better.
6. **Caption** is optional and is shown under the image. **Credit** is for
   attribution.
7. Save.
8. Go to **Projects**, open the project, and switch to the **Relationships**
   tab.
9. Under **Media**, click to add and pick the files you uploaded. Order
   matters — the first one loads eagerly, the rest lazily.
10. Click **Publish** (not Save Draft, or it will not appear publicly).
11. Rebuild the site: `npm run build` from the project root.

**The first item becomes the hero** — it replaces the generated plate at the
top of the page. The rest appear in the *Evidence* block below the case study,
lazy-loaded. A project with no media keeps the generated plate and shows no
evidence block: there is no placeholder and never a broken image.

After publishing, rebuild. The build copies every published upload into
`dist/media/`, so the deployed site carries its own images and does not need
Payload running. If a file cannot be fetched the build fails rather than
shipping a broken image (see `payload-architecture.md` → *Media reaches the
static site by snapshot*).

### Bulk import instead of clicking

The evidence already on the site is declared in `cms/src/content/media.ts`
(file, kind, alt and caption in EN/CS/SK, target project, order) and loaded
with:

```bash
cd cms && npm run media:import
```

Idempotent — matched by filename, so re-running updates metadata and
re-attaches rather than duplicating. Put new files in
`artifacts/evidence-ready/` first.

Lab notes work the same way, via **Experiments** → the note → **Relationships**.

What to shoot is listed in [`assets-needed.md`](assets-needed.md).

⚠️ Blur or replace real client names, personal data and contract content
before uploading.

## Environment variables

### CMS (`cms/.env`)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PAYLOAD_SECRET` | Yes | — | Encryption key for auth tokens |
| `DATABASE_URI` | No | `file:./data/payload.db` | SQLite path |
| `NEXT_PUBLIC_SERVER_URL` | No | `http://localhost:3000` | Self-URL for admin |
| `SITE_PRODUCTION_URL` | No | — | Added to the CORS allowlist |
| `SITE_REBUILD_HOOK_URL` | No | — | POST target after publish (not wired yet) |

### Astro (root `.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PUBLIC_CMS_URL` | `http://localhost:3000` | Where to probe and fetch |
| `CMS_REQUIRED` | `false` | `true` makes an unreachable CMS **fail** the build instead of falling back |

Leave `CMS_REQUIRED` at `false` until Payload holds content that does not
exist in the local files. After that point a silent fallback would ship a
stale site, and failing loudly is the safer default.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Payload admin on :3000 |
| `npm run build` | Production build |
| `npm run seed` | Idempotent import from `src/data/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate:types` | Regenerate `src/payload-types.ts` |
| `npm run content:import` | Case studies + lab notes into Payload |
| `npm run media:import` | Evidence files + alt/caption into Media, attached to projects |
| `npm run test:cms-fixtures:up` / `:down` | Project route-policy test documents |
| `npm run test:cms-lab:up` / `:down` | Lab route-policy test documents |
| `npm run test:cms-marker:set` / `:reset` | Content-source proof |

The `test:cms-*` scripts write throwaway documents and are **TEST ONLY — do
not run them against production.** They live in `cms/src/test/fixtures/`,
separate from the seed and the content importer, and every one of them has a
matching `:down` that must be run afterwards.

After changing a collection schema, regenerate types:

```bash
cd cms && npm run generate:types
```

## Moving to PostgreSQL

Swap the adapter in `src/payload.config.ts` for `@payloadcms/db-postgres` and
point `DATABASE_URI` at the connection string. Collections, globals and
localization config are unchanged; only the adapter differs.


## The font preload warning

Chrome logs, on every page:

> The resource `/assets/fonts/inter-tight-latin-wght-normal.woff2` was
> preloaded using link preload but not used within a few seconds…

**Investigated in Iteration 4. The preload is correct; keep it.**

Measured with `performance.getEntriesByType('resource')` and `document.fonts`:

| | |
| --- | --- |
| Fetches of that file | 1 (the preload is reused by CSS, not duplicated) |
| Preload starts at | ~16 ms |
| The other three faces start at | ~29 ms |
| `document.fonts` status | all four faces `loaded` |

So the font is fetched once, early, and used. The warning comes from Chrome's
heuristic, which wants the face *applied to rendered text* within a few
seconds — and the site's scroll-reveal deliberately starts body text at
`opacity: 0` until it scrolls into view. The heuristic and the design disagree;
the design is not wrong.

Removing the preload would cost ~13 ms on the face that renders the hero name,
which is the LCP element. Not worth silencing a cosmetic console message.
