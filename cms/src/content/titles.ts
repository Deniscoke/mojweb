/**
 * PROJECT TITLES — canonical, per locale.
 *
 *   npm run content:titles
 *
 * Making `title` localized moves it out of the projects table and into the
 * locales table, so the schema push drops the original column. This script is
 * the authoritative record of every title and restores them afterwards,
 * including the three archived drafts in the Lab.
 *
 * Brand names are identical in every locale. Descriptive names are translated.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { FULL_LOCALES, SHORT_LOCALES, type AnyLocale } from './lexical'

const ALL_LOCALES = [...FULL_LOCALES, ...SHORT_LOCALES] as AnyLocale[]

/** A brand name: the same string in all six. */
function brand(name: string): Record<AnyLocale, string> {
  return Object.fromEntries(ALL_LOCALES.map((l) => [l, name])) as Record<AnyLocale, string>
}

export const titles: Record<string, Record<AnyLocale, string>> = {
  // ── Selected Work ──
  pravo365: brand('Pravo365'),
  'moodpack-director': brand('Moodpack / Director'),
  'web-digital-work': {
    en: 'Web & Digital Work',
    cs: 'Web a digitální práce',
    sk: 'Web a digitálna práca',
    es: 'Web y trabajo digital',
    sr: 'Veb i digitalni rad',
    tr: 'Web ve dijital işler',
  },
  'circus-movement': {
    en: 'Circus & Movement',
    cs: 'Cirkus a pohyb',
    sk: 'Cirkus a pohyb',
    es: 'Circo y movimiento',
    sr: 'Cirkus i pokret',
    tr: 'Sirk ve hareket',
  },
  'snowboard-coaching': {
    en: 'Snowboard Coaching',
    cs: 'Výuka snowboardingu',
    sk: 'Výučba snowboardingu',
    es: 'Clases de snowboard',
    sr: 'Obuka snoubordinga',
    tr: 'Snowboard eğitimi',
  },

  // ── Pre-rename slugs, in case this runs before the rename ──
  'contemporary-circus': brand('Contemporary Circus'),
  snowboarding: brand('Snowboarding'),

  // ── Archived drafts, now lab notes. Brand-ish names, kept as they were. ──
  'art-learning': brand('Art Learning'),
  'digital-space': brand('Digital Space / Heritage'),
  'ai-commerce-engine': brand('AI Commerce Engine'),
}

async function main() {
  const payload = await getPayload({ config })

  // Drafts included: the archived case studies need their titles back too.
  const all = await payload.find({
    collection: 'projects',
    limit: 500,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })

  console.log(`\n[titles] ${all.docs.length} project record(s) found.`)

  let restored = 0
  const unknown: string[] = []

  for (const doc of all.docs) {
    const map = titles[doc.slug]
    if (!map) {
      unknown.push(doc.slug)
      continue
    }
    for (const locale of ALL_LOCALES) {
      await payload.update({
        collection: 'projects',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: { title: map[locale] },
      })
    }
    restored++
    console.log(`  ✓ ${doc.slug} → ${map.en}`)
  }

  if (unknown.length) {
    console.warn(`\n  ! No title on record for: ${unknown.join(', ')}`)
    console.warn('    Add them to src/content/titles.ts before relying on this.')
  }

  console.log(`\n[titles] Restored ${restored} title(s) across ${ALL_LOCALES.length} locales.`)
  process.exit(unknown.length ? 1 : 0)
}

void main()
