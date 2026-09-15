# Iteration 5.1 — real movement content, positioning, fallback snapshot

## Positioning

| | |
| --- | --- |
| Role | Creative Technologist · Educator · **Movement Coach** |
| Fields | Technology · Learning · **Movement** · Creative Work |
| Band | BUILD · TEACH · MOVE · EXPLORE, each with the domains it covers |

The role line was the one thing on the site still contradicting the widened
positioning. It now names movement explicitly and stops at three titles.

## Selected Work

1. **Pravo365** — unchanged
2. **Web & Digital Work** — now a real commercial offer
3. **Circus & Movement** — was a one-line stub, now a real profile
4. **Moodpack / Director** — unchanged
5. **Snowboard Coaching** — was a one-line stub, now a real profile

Slugs changed: `contemporary-circus` → `circus-movement`,
`snowboarding` → `snowboard-coaching`. The site is not deployed, so no public
URL breaks.

## What the movement pages now say

Both use the profile section shape rather than the software case-study one:
**Overview → What it involves → Idea → Who it's for → Available for**. Three
new localized rich-text fields (`practice`, `people`, `availability`) back
those headings, because "Process" and "Current state" describe a codebase, not
a practice.

### Circus & Movement — stated

- Roughly five years of practice and teaching
- Children and young people, roughly ages 6–16
- Juggling, object manipulation, balance, basic acrobatics, coordination,
  performative elements, group work
- Local youth and movement activities in the Žďár nad Sázavou area
- The children's programme connected with the **KoresponDance festival**
- Available for workshops, regular or short-term training, and external
  school / community programmes

### Circus & Movement — deliberately NOT stated

- **No organisation name.** Referred to approximately as "Aktív", unconfirmed.
  A guessed legal name would be a fabricated affiliation, so the copy says
  "local youth and movement activities in the Žďár nad Sázavou area".
- No employment, partnership or authorship claim regarding KoresponDance — it
  appears only as participation in the children's programme.
- No participant numbers, no venues, no outcomes.

### Snowboard Coaching — stated

- Snowboarding since around age eighteen
- Holds **a qualification in the basics of school snowboarding**
- Has taught children, primary-school-aged learners, adults, friends and family
- Vysočina — mainly Nové Město na Moravě and Žďár nad Sázavou
- Basic stance, balance, board control, turning fundamentals, confidence
- Seasonal winter sessions by arrangement, external and independent

### Snowboard Coaching — deliberately NOT stated

- **No certificate title, awarding body or level.** The exact wording was not
  supplied, so none is invented.
- No resort is named.
- No racing or advanced freestyle instruction is implied — the copy says the
  opposite, explicitly.

## Web & Digital Work

The two modes are the substance of the page:

- **Mode A** — you know what you need. Brief → design → build → deliver.
- **Mode B** — you have a problem or an idea and no picture of the solution.
  Work out the actual problem first. *"Sometimes the answer turns out not to be
  a website at all."*

Offer: complete sites, redesigns, landing pages, AI integrations, API work,
automation, databases, hosting and deployment, consultation. Audience:
self-employed people, small organisations, businesses, cultural projects.

**No client is named and no screenshot is published.** See
[`web-projects-review.md`](web-projects-review.md) — twelve directories were
catalogued, most involving real named businesses and two named individuals.

## Fallback snapshot — the drift is fixed

```
Payload  ──►  npm run cms:snapshot-fallback  ──►  src/data/generated/*.data.ts
```

**One way only.** `src/data/*.ts` now holds types and helpers; the content
lives in `src/data/generated/`, each file carrying a
`DO NOT EDIT MANUALLY` banner.

Parity, measured:

| | Routes |
| --- | --- |
| CMS ON (`CMS_REQUIRED=true`) | **109** |
| CMS OFF (snapshot) | **109** |
| Set difference | **none — identical** |

Before this, CMS-off produced 43 pages of a two-iteration-old architecture.

Not captured: media binaries. A fallback build renders no evidence images; the
files live in the CMS and are copied into `dist/` by the media-snapshot step of
a CMS-on build.

## The seed is retired

`npm run seed` wrote `src/data` **into** Payload. With the snapshot flowing the
other way, running both forms a loop that can only lose information — and it
historically clobbered authored case studies and rewrote live slugs.

It now refuses with an explanation and a pointer to the right command. The one
legitimate use — bootstrapping a genuinely empty database — needs
`npm run seed -- --force-bootstrap`.

Verified: snapshot → seed → build leaves Circus, Snowboard, slugs,
`writtenLocales`, relationships and the Lab arrangement untouched.

## Font preload — investigated, corrected

The Iteration 3 warning was real but the diagnosis in the code comment was
wrong. `ć` in **Mitrović** is U+0107, which lives in **latin-ext**, not latin —
and that name is set at display size on every page. So the larger, always-needed
cut was the one *not* being preloaded, while the smaller one was.

Both cuts are now preloaded. This changes when the files start downloading, not
how many bytes are fetched: latin-ext moved from ~55 ms to ~18 ms.

The warning can still appear on a cold load. The cause is the site's own entry
transition: every page hides its content behind the cover for ~620 ms, past
Chrome's "used within a few seconds" heuristic, so the font loads but paints no
visible glyph in time. Under `prefers-reduced-motion` the cover clears in 140 ms
and text paints at once — which is exactly the case the preload serves. Kept
deliberately; the fonts are verifiably loaded and applied
(`document.fonts.check` → true, `h1` computed family confirms).

## Localization

All new copy in six locales: role line, credo hints, the seven *Where I can be
useful* items, three new section headings, the About arc, and full short fields
for the three rebuilt entries.

`title` is now **localized** — brand names identical everywhere, descriptive
names translated (`Circus & Movement` → `Cirkus a pohyb` → `Sirk ve hareket`).
Long-form prose remains EN/CS/SK with the honest fallback note.

⚠️ Making `title` localized moved it to the locales table, so the schema push
dropped the original column with a data-loss warning. The database was backed
up to `cms/data/payload.pre-localized-title.db` first, and
`npm run content:titles` is the authoritative record that restored all eight
titles (drafts included).

## Still needed from Denis

1. **Exact snowboard qualification title** — copy is conservative without it.
2. **Exact public name of the Žďár organisation** — omitted until confirmed.
3. **Which web projects may be shown and named** — see
   [`web-projects-review.md`](web-projects-review.md).
4. **Photographs** — see [`assets-needed.md`](assets-needed.md), including the
   consent rules for images involving children.
