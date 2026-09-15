# Content model

## The rule

> **Structure and identity live in `data/`. Site chrome and narrative live in
> `i18n/translations/`. Nothing lives in a component.**

If you find yourself typing a sentence a visitor will read into a `.astro`
file, it belongs in one of the two places below.

## 1. `src/config/site.ts` — identity

Brand name, tagline, positioning statement, author name and role, disciplines,
deployed URL, contact details, Open Graph image.

Everything here is a placeholder pending the real brand. Rebranding the site
means editing this one file.

`contact.email` and every `contact.links[].href` are `null`. A `null` is not
rendered, and the contact section shows an honest "contact details are being
added" note instead. **Do not fill these with plausible guesses.**

## 2. `src/i18n/translations/<code>.ts` — chrome and narrative

One file per locale, each typed as `Dictionary` (see `src/i18n/dictionary.ts`).

| Key | Covers |
| --- | --- |
| `meta` | `<title>` and meta description |
| `nav` | Navigation labels, menu and skip-link text |
| `hero` | Statement, intro line, scroll cue |
| `work` | Section heading and lead, project status names, link labels |
| `services` | "What I do" — the four areas, title and body each |
| `lab` | Section heading and lead |
| `about` | Heading, pull quote, narrative paragraphs |
| `currently` | Section label and the four kind labels |
| `contact` | Heading, lead, CTA, pending note |
| `footer` | Colophon, back-to-top, working-translation note |

Because each file is typed as `Dictionary`, a missing key is a build error.
You cannot ship a locale with holes in it.

### Translation status

`quality` in `src/i18n/locales.ts`:

- `reviewed` — **EN, CS, SK.** Full working copy.
- `working` — **ES, SR, TR.** Honest drafts, translated from the English.
  These locales render a note in their own footer saying so. When copy is
  reviewed, flip `quality` to `reviewed` and the note disappears.

Serbian is **Latin script only**. No Cyrillic anywhere. The internal code is
`sr`, the metadata tag is `sr-Latn`, and the public route stays `/sr/`.

## 3. `src/data/*.ts` — content entities

Entity copy is inline and per-locale via `LocalizedText`:

```ts
// A string when it does not translate — a product name, a proper noun.
category: 'LegalTech / AI / Product',

// A map when it does. `en` is required; anything missing falls back to it.
description: {
  en: 'A digital product for drafting contract proposals…',
  sk: 'Digitálny produkt zameraný na tvorbu návrhov zmlúv…',
},
```

### `projects.ts` — Selected Work

| Field | Notes |
| --- | --- |
| `slug` | Stable id; also the seed for the generated plate and the future detail route |
| `title` | Product name, not translated |
| `category` | `LocalizedText` |
| `description` | `LocalizedText` |
| `status` | Array of `live` / `in-development` / `prototype` / `experiment`; labels come from the dictionaries |
| `href` | `null` renders a non-linked entry, never a dead link |
| `visual` | `strata` / `orbit` / `grid` / `scan` / `flux` — which plate is drawn |
| `hue` | 0–360; drives the plate accent and the row hover colour |
| `featured` | Whether it appears on the homepage |

### `experiments.ts` — Lab

`title` (usually a question), `state` (`open-question` / `in-progress` /
`ongoing`) and a short untranslated `tag`.

### `currently.ts` — Currently

The most frequently edited file on the site. `kind` selects the label from the
dictionary; `value` is the thing itself. `currentlyUpdated` is a stamp shown
next to the module, so a stale "currently" is visibly stale rather than
quietly wrong.

## Imagery

There is no photography, and there are no stock images. Each project draws a
deterministic SVG plate seeded from its slug
(`components/projects/ProjectVisual.astro`), generated at build time.

When real imagery exists, add an optional `image` field to `Project` and let
the plate remain the fallback. Do not replace the plates with grey boxes.

## What must never be invented

Job titles, employers, clients, partners, user or revenue numbers, awards,
press mentions, testimonials, degrees, contact details.

If a fact was not supplied, it is either absent or marked `null` / `TODO` in
the data. An honest gap is a smaller problem than a confident fabrication on a
personal site.
