# Iteration 3 — CMS notes

> **Iteration 3 is done.** This file now records what shipped and what the
> next iteration inherits. The rules below still hold.

## Where things stand after Iteration 3

Delivered: full case studies for all five projects (EN/CS/SK), eight lab notes
with `/[lang]/lab/` and `/[lang]/lab/[slug]/`, project ↔ experiment
relationships, a media pipeline, and homepage copy reduced where it duplicated
the case studies. 91 pages, all Payload-sourced.

Still outstanding, and it is the big one: **no real assets exist yet.** Every
project plate is still a generated SVG. See
[`assets-needed.md`](assets-needed.md) — 20 required, 16 nice-to-have.

## Where things stood after Iteration 2.6

**Payload is now the canonical content source** for Projects, Experiments,
Currently and the relevant Site Settings.

When Payload is reachable it decides both what content says *and which pages
exist*. Publishing a project in the admin gives it a public route in every
locale on the next build, with no source-code change.

The local TypeScript content in `src/data/` exists only as:

- an emergency / development fallback, so the site still builds with no CMS
- a migration safety net, so a lost database is recoverable
- the seed input

It is **not** the primary database any more, and it is not the place to add
new content.

## What this means for Iteration 3

New portfolio content goes **into Payload**, in the Payload schema — not
appended to `src/data/projects.ts`.

Expanding the local files as though they were the database would re-create
the drift this iteration removed: two datasets, silently disagreeing, with
the winner decided by whether a server happened to be running.

If a new field is needed:

1. Add it to the collection in `cms/src/collections/`
2. `cd cms && npm run generate:types`
3. Extend the raw type in `src/lib/cms/types.ts`
4. Map it in `src/lib/cms/normalize.ts`
5. Only mirror it into `src/data/*.ts` if the fallback genuinely needs it

Keep the fallback dataset *coherent*, not *complete*. It has to render a
working site, not reproduce every CMS field.

## Ready to build on

### Lab detail routes — DONE in Iteration 3

`/[lang]/lab/[slug]/` and `/[lang]/lab/` now exist and follow the same
canonical-source policy as projects, plus the thin-page rule
(`hasLabDetail()`). Kept here for reference:

```ts
import { getExperimentRouteSlugs, getExperimentBySlug } from '~/lib/cms';

export async function getStaticPaths() {
  const slugs = await getExperimentRouteSlugs();
  return LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({
      params: { lang: locale.route, slug },
      props: { code: locale.code, slug },
    })),
  );
}
```

Published experiments determine the slugs when Payload is the source; local
`experiments[].id` values do when it is not.

All three log fields (`whatITried`, `whatHappened`, `nextQuestion`) are now
written for all eight experiments in EN/CS/SK, and five of the eight carry a
`relatedProject`. The other three are genuinely standalone and are left null
rather than forced into a project.

### Media — pipeline DONE, assets outstanding

The full path now exists: Media gains a `kind` field, the normalizer converts
uploads into `MediaItem`, and `MediaFigure.astro` renders them in an
*Evidence* block on project and lab pages. Diagrams get a padded light frame,
screenshots run edge to edge, `alt` is never invented, and a project with no
media renders no block rather than a placeholder.

What is missing is the files themselves. Until they exist the case studies are
text-only, which is the single biggest remaining gap on the site.

One open question for deployment: media URLs are currently absolute against
`PUBLIC_CMS_URL`, so a static build references the CMS origin. Before going
live, either copy uploads into `dist/` at build time or serve them from a
stable public URL.

## Before going live

- Set `CMS_REQUIRED=true` for production builds once Payload holds content
  that is not in the local files. Until then an outage would silently ship a
  stale site.
- Migrate SQLite → PostgreSQL (adapter swap; see `payload-development.md`).
- Wire `SITE_REBUILD_HOOK_URL` so publishing triggers a rebuild. The hook
  helper exists in `cms/src/hooks/triggerSiteRebuild.ts` and is currently a
  no-op that is not attached to any collection.
- Confirm `src/config/site.ts` contact details, or leave them `null`. They
  are `null` by design and must not be invented.

## Inherited by Iteration 4

- **Assets.** 20 required files. Nothing else on the list moves the needle as
  much.
- **ES / SR / TR case-study prose.** Short fields are translated in all six
  locales; long prose is EN/CS/SK. See
  [`localization-status.md`](localization-status.md).
- **Media hosting** for a static deploy (see above).
- **`CMS_REQUIRED=true`** for production builds.
- **Rebuild hook** — still a no-op, deliberately.

## Rules that still hold

- Do not delete `src/data/projects.ts`, `experiments.ts`, `currently.ts`.
- Do not invent content — no fabricated clients, metrics, awards, revenue,
  testimonials, partnerships or contact details. Unknown stays out or is
  marked TODO.
- Astro stays Astro. Payload is not the website.
