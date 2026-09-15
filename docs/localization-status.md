# Localization status

Six locales. Serbian is **Latin script only** throughout.

No translation-workflow engine was built for this. The state is tracked in two
places only: `writtenLocales` on each project in Payload (which drives the
visible "not translated yet" note), and this document.

## Summary

| Locale | UI chrome | Homepage | Project short fields | Case-study prose | Lab notes |
| --- | --- | --- | --- | --- | --- |
| `en` English | ✅ full | ✅ full | ✅ full | ✅ full | ✅ full |
| `cs` Čeština | ✅ full | ✅ full | ✅ full | ✅ full | ✅ full |
| `sk` Slovenčina | ✅ full | ✅ full | ✅ full | ✅ full | ✅ full |
| `es` Español | ✅ full | ✅ full | ✅ full | ⬜ EN fallback | ⬜ EN fallback |
| `sr` Srpski (Latin) | ✅ full | ✅ full | ✅ full | ⬜ EN fallback | ⬜ EN fallback |
| `tr` Türkçe | ✅ full | ✅ full | ✅ full | ⬜ EN fallback | ⬜ EN fallback |

**UI chrome** — navigation, section headings, status labels, buttons, the
language gate. Lives in `src/i18n/translations/*.ts` and is type-enforced:
`astro check` fails if a locale is missing a key, so a half-added language
cannot ship.

**Homepage** — hero, the BUILD · TEACH · MOVE · EXPLORE band, Selected Work
leads, *Things I can help with* (seven items), About, Currently, Contact.
Fully written in all six.

Project **titles** are localized as of Iteration 5.1: brand names are
identical in every locale, descriptive names are translated (`Circus &
Movement` → `Cirkus a pohyb` → `Sirk ve hareket`). The `ongoing` status label
and the three profile-section headings (*What it involves*, *Who it's for*,
*Available for*) are translated in all six. The disciplines
line (`Technology · Learning · Movement · Creative Work`) remains English-only
by design — see *Known gaps*.

**Project short fields** — category, short description, subtitle, and the
driving question. Written in all six locales, so every project card and every
project page header reads natively.

**Case-study prose** — the eight long-form sections (overview, context, idea,
process, technology, experiments, current state, what I learned). Written in
EN, CS and SK.

**Lab notes** — question, short note, what I tried / what happened / next
question. Written in EN, CS and SK.

## What a Spanish, Serbian or Turkish visitor sees

Not a broken page, and not a silent lie.

- The whole interface, the homepage, and every project's heading block are in
  their language.
- The long case-study body falls back to English, and the page says so:
  *"This case study has not been translated yet. It is shown in English."*

That note is driven by `writtenLocales` on the project. It is honest by
construction — a locale is either in that array or the reader is told.

## Why the split

Long-form prose is where translation quality actually matters and where a
mediocre machine translation is most obvious. The short fields carry most of
the navigational value per word, so translating those six ways and the long
prose three ways buys the largest share of the benefit.

This is a deliberate stopping point, not an oversight.

## Finishing ES / SR / TR

Nothing in the code needs to change. The work is:

1. Open the project in the Payload admin.
2. Switch the locale selector to `es` / `sr` / `tr`.
3. Fill in the eight prose fields.
4. On the **Settings** tab, add the locale to `writtenLocales`.
5. Publish, then rebuild Astro.

Adding the locale to `writtenLocales` is what removes the fallback note, so do
it only once the prose is actually there. Same procedure for experiments,
minus step 4 — lab notes have no per-locale flag and fall back silently, which
is acceptable for short rough notes.

## Known gaps

- **Lab notes have no `writtenLocales` equivalent.** An untranslated lab note
  falls back to English without a note. Given their length this is a
  deliberate trade, but it is the one place the site falls back silently.
- **`site.author.disciplines`** in `src/config/site.ts` is English-only in
  every locale ("Technology × Education × AI × Creative Work"). It reads as a
  keyword line rather than a sentence, so it has been left as-is.
- **Project titles are not translated.** Deliberate: they are proper nouns.
