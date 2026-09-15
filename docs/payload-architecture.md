# Payload CMS — Architecture

## The rule

**Payload available → Payload is the canonical source.**
**Payload unavailable → local TypeScript files are the source.**

Not a hybrid. Never routes from one and content from the other.

A build that took its route list from `src/data/projects.ts` while rendering
those pages from the CMS is the failure mode this design exists to prevent:
a project published in the admin would silently have no page, and a project
deleted in the admin would render an empty one. Both look like the site is
broken rather than like the CMS is out of sync.

## Source resolution

`src/lib/cms/source.ts` owns one decision per build.

```
resolveContentSource()
  ├─ GET http://localhost:3000/api/projects?limit=0   (3s timeout)
  │
  ├─ 200 OK ────────────► 'payload'   logs "[CMS] Source: Payload"
  │
  └─ unreachable ───────► CMS_REQUIRED=true  → throw, build FAILS
                          CMS_REQUIRED=false → 'fallback'
                          logs "[CMS] Payload unavailable — using local fallback data"
```

The returned promise is memoised, so the probe fires **once** per build no
matter how many pages, components and `getStaticPaths()` calls ask for it.
Every fetcher and every route helper reads that same cached answer, which is
what makes the whole build consistent by construction rather than by
convention.

## Data flow

```
┌──────────────────────── Astro build (static) ────────────────────────┐
│                                                                       │
│  resolveContentSource()  ──►  'payload' | 'fallback'   (cached once)  │
│         │                                                             │
│         ├─────────────────┬───────────────────────────┐               │
│         ▼                 ▼                           ▼               │
│   routes.ts          projects.ts /              currently.ts /        │
│   getProjectRouteSlugs()  experiments.ts        siteSettings.ts       │
│         │                 │                           │               │
│         └─────────────────┴───────────────────────────┘               │
│                           │                                           │
│              payload ─────┴───── fallback                             │
│                 │                    │                                │
│                 ▼                    ▼                                │
│         REST /api/  (published)   src/data/*.ts                       │
│         + normalize.ts                                                │
│                 │                    │                                │
│                 └────────┬───────────┘                                │
│                          ▼                                            │
│              Project / Experiment / CurrentlyItem                     │
│              (one view model, same shape either way)                  │
└───────────────────────────────────────────────────────────────────────┘
```

The normalizers exist so the rest of the site never learns which source won.
`SelectedWork.astro` receives a `Project[]` and cannot tell whether it came
from SQLite or from a TypeScript array.

## Route generation

`src/lib/cms/routes.ts` is the piece that makes Payload genuinely canonical.

```ts
// src/pages/[lang]/projects/[slug].astro
export async function getStaticPaths() {
  const slugs = await getProjectRouteSlugs();
  return LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ params: { lang: locale.route, slug }, ... })),
  );
}
```

`getProjectRouteSlugs()` returns published CMS slugs when the source is
Payload, and local slugs otherwise. Slugs are **not** localized in Payload,
so one query serves all six locales and the locale fan-out stays in Astro.

Route count is therefore always `locales × published documents`.

`getExperimentRouteSlugs()` applies the identical policy to
`/[lang]/lab/[slug]/`, with one extra rule: only experiments that have a
written log get a route. An entry that is still just a question would
otherwise become six near-empty documents, so it stays on the Lab index
instead. `hasLabDetail()` in `relationships.ts` is that check.

## Draft safety

Drafts are excluded at the query layer, not filtered afterwards.
`cmsGet()` in `client.ts` forces `where[_status][equals]=published` onto every
collection request and does not let a caller override it:

```ts
// Published-only is not caller-overridable: it is the security boundary.
appendWhere(params, { ...options.where, _status: { equals: 'published' } });
```

Because route generation goes through the same `cmsGet()`, a draft project
cannot produce a route, cannot appear in Selected Work, and cannot be reached
by the anonymous requests the build makes. There is no separate "hide drafts"
step that could be forgotten.

Astro never authenticates against Payload. No admin credentials exist on the
frontend side, so the build can only ever see what an anonymous visitor sees.

## Relationships are stored once

`Experiment.relatedProject` is the only stored direction. A project's related
experiments are **derived** at build time by
`src/lib/cms/relationships.ts` — `getExperimentsForProject()` filters the
experiment list by `relatedProjectSlug`.

Storing the reverse direction as well would create two truths that can
disagree, and nothing would say which one is right. Where a relationship is
genuinely ambiguous (an experiment that spans two projects) it is left null
rather than guessed.

## Content lives in two places, with a rule

| | `src/data/*.ts` | `cms/src/content/*.ts` |
| --- | --- | --- |
| Role | fallback + seed input | the authored case studies |
| Written into Payload by | `npm run seed` | `npm run content:import` |
| Overwrites existing prose | **no** | yes |

The seed exists to make an empty database usable and to keep the fallback
honest. It writes long-form prose only when it is *creating* a record, and
leaves `slug` alone on records that already exist. Both guards exist because
without them a routine `npm run seed` silently reverted authored case studies
and changed live Lab URLs.

## Media reaches the static site by snapshot

Payload serves uploads from its own origin. A static build pointing `<img src>`
there would break the moment the CMS went down, and would make every visitor
depend on the admin server.

So the built site carries its own copies:

```
normalize.ts        media doc -> src="/media/<id>-<filename>"   (stable path)
        │
        ▼
astro:build:done    integrations/media-snapshot.mjs
                      GET /api/media  -> download each published upload
                      write dist/media/<id>-<filename>
```

The filename scheme is the one thing both halves must agree on, and it is
deliberately trivial: `<id>-<filename>`. `localMediaPath()` in `normalize.ts`
and `localName()` in the integration are twins; there is a comment on each
pointing at the other.

Result: `dist/` contains every image it references and **zero** references to
the CMS origin. The deployed site needs nothing from Payload at runtime.

### Failure policy

A referenced upload that cannot be fetched would ship as a broken image, which
is exactly the silent failure this design removes:

| Situation | Behaviour |
| --- | --- |
| CMS unreachable at snapshot time | Nothing to snapshot — the build was fallback-sourced and references no uploads. Logged, build succeeds. |
| CMS reachable, a file fails to download, `CMS_REQUIRED=true` | **Build fails**, listing each file. |
| Same, `CMS_REQUIRED=false` | Loud warning naming the files and stating that pages will have broken images. |

### Production

This is option A from the Iteration 3 notes, and it is the recommendation for
production too: the deploy artefact is self-contained, cache-friendly, and has
no runtime CMS dependency. Object storage (S3/R2 via a Payload storage adapter)
only becomes worth it if uploads grow large enough that shipping them inside
the deploy is wasteful. At 444 KB it is not close.

## Collections & globals

| Type | Slug | Drafts | Localized |
| --- | --- | --- | --- |
| Collection | `users` | No | No |
| Collection | `projects` | Yes | Yes (6 locales) |
| Collection | `experiments` | Yes | Yes (6 locales) |
| Collection | `media` | No | Yes (alt/caption) |
| Global | `currently` | No | Yes |
| Global | `site-settings` | No | Yes (tagline) |

Locales: `en` (default), `cs`, `sk`, `es`, `sr`, `tr`, with fallback to `en`.

## Failure behaviour

| Environment | Payload down | Result |
| --- | --- | --- |
| Development | yes | Warning, build succeeds on fallback |
| Production, `CMS_REQUIRED=false` (current default) | yes | Warning, build succeeds on fallback |
| Production, `CMS_REQUIRED=true` | yes | Build **fails** |

`CMS_REQUIRED` is off in this iteration. It exists so that once Payload holds
content that does not exist in the local files, a CMS outage during a
production build fails loudly instead of shipping a silently stale site.

## Why the local files still exist

`src/data/projects.ts`, `experiments.ts` and `currently.ts` are **not** dead
code and must not be deleted. They are:

- the development fallback, so the site runs without booting a CMS
- the migration safety net, so a database loss is recoverable
- the seed input (`cms/src/seed/index.ts` reads them)

They are no longer the primary database. See
[`iteration-3-cms-notes.md`](iteration-3-cms-notes.md).
