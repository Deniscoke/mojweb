/**
 * SEED SCRIPT
 * -----------
 * Reads existing src/data files and creates Payload records.
 * Idempotent: uses slug/identifier to upsert. Safe to run multiple times.
 *
 * Usage: cd cms && npm run seed
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

// ── Existing data (imported as plain objects) ──

type LocalizedText = string | ({ en: string } & Partial<Record<string, string>>)

interface ExistingProject {
  slug: string
  title: LocalizedText
  category: LocalizedText
  description: LocalizedText
  status: string[]
  href: string | null
  visual: string
  hue: number
  featured: boolean
  detail?: {
    subtitle: LocalizedText
    disciplines: string[]
    sections: Array<{ id: string; body: LocalizedText[] }>
    written: string[]
  }
}

interface ExistingExperiment {
  id: string
  title: LocalizedText
  state: string
  tag: string
}

interface ExistingCurrentlyItem {
  id: string
  kind: string
  value: LocalizedText
  href?: string | null
}

const LOCALES = ['en', 'cs', 'sk', 'es', 'sr', 'tr'] as const

function resolveText(value: LocalizedText, locale: string): string | undefined {
  if (typeof value === 'string') return value
  return value[locale] ?? value.en
}

function sectionsToPlainText(
  body: LocalizedText[],
  locale: string,
): string {
  return body.map((b) => resolveText(b, locale) ?? '').join('\n\n')
}

/**
 * ⚠️ RETIRED — no longer part of the normal workflow.
 *
 * This seeds Payload *from* `src/data/*.ts`. Since Iteration 5.1 the direction
 * is reversed: Payload is canonical and `src/data/generated/*` is produced from
 * it by `npm run cms:snapshot-fallback`. Running the seed now pushes a
 * generated snapshot back into the CMS it came from — a loop that can only
 * lose information, and which historically clobbered authored case studies and
 * rewrote live slugs.
 *
 * Kept for exactly one case: bootstrapping a genuinely empty database from the
 * checked-in fallback. That needs the explicit flag.
 */
function assertBootstrapIntent(): void {
  if (process.argv.includes('--force-bootstrap')) {
    console.warn('[seed] --force-bootstrap given. Writing src/data/* into Payload.\n')
    return
  }

  console.error(
    [
      '',
      '  x  `npm run seed` is retired.',
      '',
      '     Payload is the canonical source. This script writes the OPPOSITE way',
      '     (src/data -> Payload) and would overwrite CMS content with a snapshot',
      '     generated from it.',
      '',
      '     You probably want one of:',
      '       npm run content:import           case studies + lab notes',
      '       npm run content:movement         circus / snowboard / web work',
      '       npm run restructure              Selected Work arrangement',
      '       npm run cms:snapshot-fallback    Payload -> src/data/generated (repo root)',
      '',
      '     To bootstrap a genuinely EMPTY database from the fallback files:',
      '       npm run seed -- --force-bootstrap',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

async function seed() {
  assertBootstrapIntent()

  console.info('[seed] Initializing Payload...')
  const payload = await getPayload({ config })

  // ── Load existing data dynamically ──
  // We read the TS files relative to the project root
  const projectsModule = await import('../../../src/data/projects')
  const experimentsModule = await import('../../../src/data/experiments')
  const currentlyModule = await import('../../../src/data/currently')

  const existingProjects: ExistingProject[] = projectsModule.projects
  const existingExperiments: ExistingExperiment[] = experimentsModule.experiments
  const existingCurrently: ExistingCurrentlyItem[] = currentlyModule.currently
  const currentlyUpdated: string = currentlyModule.currentlyUpdated

  // ── Seed Projects ──
  console.info(`[seed] Seeding ${existingProjects.length} projects...`)

  for (let i = 0; i < existingProjects.length; i++) {
    const p = existingProjects[i]!
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: p.slug } },
      limit: 1,
      depth: 0,
    })

    /**
     * Payload is the canonical source once a project exists, and the CMS
     * prose is richer than the fallback files. So the seed writes long-form
     * prose only when it is creating the record; on an existing one it
     * refreshes structure and short fields and leaves the case study alone.
     * Without this, re-running the seed silently reverts authored content.
     */
    const isNew = existing.docs.length === 0

    const projectData: Record<string, unknown> = {
      title: resolveText(p.title, 'en'),
      slug: p.slug,
      status: p.status,
      featured: p.featured,
      order: i,
      visual: p.visual,
      hue: p.hue,
      externalUrl: p.href ?? undefined,
      _status: 'published',
    }

    /**
     * `disciplines` and `writtenLocales` belong to the case study, and only
     * two of the fallback projects carry a `detail` block at all. Writing them
     * unconditionally sent `null` for the rest, wiping values the CMS owned —
     * which also made Czech and Slovak readers see a "not translated" note on
     * pages that were translated. Seeded on creation only, like the prose.
     */
    if (isNew && p.detail) {
      projectData.disciplines = p.detail.disciplines
      projectData.writtenLocales = p.detail.written
    }

    // Set localized fields for each locale
    for (const locale of LOCALES) {
      const localeData: Record<string, unknown> = {}

      localeData.category = resolveText(p.category, locale)
      localeData.shortDescription = resolveText(p.description, locale)

      if (p.detail && isNew) {
        localeData.subtitle = resolveText(p.detail.subtitle, locale)

        for (const section of p.detail.sections) {
          const text = sectionsToPlainText(section.body, locale)
          const fieldMap: Record<string, string> = {
            overview: 'overview',
            context: 'context',
            idea: 'idea',
            process: 'process',
            technology: 'technology',
            experiments: 'experiments',
            state: 'currentState',
          }
          const fieldName = fieldMap[section.id]
          if (fieldName && text) {
            localeData[fieldName] = text
          }
        }
      }

      if (locale === 'en') {
        Object.assign(projectData, localeData)
      } else {
        // Localized fields need to be set via locale parameter
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'projects',
            id: existing.docs[0]!.id,
            locale,
            data: localeData as never,
          })
        }
      }
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'projects',
        id: existing.docs[0]!.id,
        data: projectData as never,
      })
      console.info(`  ✓ Updated: ${resolveText(p.title, 'en')} (structure only — case-study prose left as-is)`)
    } else {
      const created = await payload.create({
        collection: 'projects',
        data: projectData as never,
      })
      // Now set localized content for non-default locales
      for (const locale of LOCALES) {
        if (locale === 'en') continue
        const localeData: Record<string, unknown> = {}
        localeData.category = resolveText(p.category, locale)
        localeData.shortDescription = resolveText(p.description, locale)
        if (p.detail) {
          localeData.subtitle = resolveText(p.detail.subtitle, locale)
          for (const section of p.detail.sections) {
            const text = sectionsToPlainText(section.body, locale)
            const fieldMap: Record<string, string> = {
              overview: 'overview',
              context: 'context',
              idea: 'idea',
              process: 'process',
              technology: 'technology',
              experiments: 'experiments',
              state: 'currentState',
            }
            const fieldName = fieldMap[section.id]
            if (fieldName && text) {
              localeData[fieldName] = text
            }
          }
        }
        await payload.update({
          collection: 'projects',
          id: created.id,
          locale,
          data: localeData as never,
        })
      }
      console.info(`  ✓ Created: ${resolveText(p.title, 'en')}`)
    }
  }

  // ── Seed Experiments ──
  console.info(`[seed] Seeding ${existingExperiments.length} experiments...`)

  for (let i = 0; i < existingExperiments.length; i++) {
    const e = existingExperiments[i]!
    const existing = await payload.find({
      collection: 'experiments',
      where: { identifier: { equals: e.id } },
      limit: 1,
      depth: 0,
    })

    const enTitle = resolveText(e.title, 'en')!

    /**
     * `slug` is the public URL and may have been given a friendlier value in
     * the CMS than the machine identifier, so it is seeded only on creation.
     * Rewriting it on every run would silently change live lab URLs.
     */
    const experimentData: Record<string, unknown> = {
      identifier: e.id,
      title: enTitle,
      status: e.state,
      tag: e.tag,
      order: i,
      _status: 'published',
    }

    if (existing.docs.length === 0) {
      experimentData.slug = e.id
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'experiments',
        id: existing.docs[0]!.id,
        data: experimentData as never,
      })
      for (const locale of LOCALES) {
        if (locale === 'en') continue
        const locTitle = resolveText(e.title, locale)
        if (locTitle) {
          await payload.update({
            collection: 'experiments',
            id: existing.docs[0]!.id,
            locale,
            data: { title: locTitle } as never,
          })
        }
      }
      console.info(`  ✓ Updated: ${enTitle}`)
    } else {
      const created = await payload.create({
        collection: 'experiments',
        data: experimentData as never,
      })
      for (const locale of LOCALES) {
        if (locale === 'en') continue
        const locTitle = resolveText(e.title, locale)
        if (locTitle) {
          await payload.update({
            collection: 'experiments',
            id: created.id,
            locale,
            data: { title: locTitle } as never,
          })
        }
      }
      console.info(`  ✓ Created: ${enTitle}`)
    }
  }

  // ── Seed Currently (Global) ──
  console.info('[seed] Seeding Currently global...')

  /**
   * Payload keys array rows by `id`. Passing `items` without ids on each
   * locale pass recreates the rows from scratch and discards whatever the
   * previous pass wrote, leaving only the last locale populated. So: write
   * once to create the rows, read their ids back, then update each locale
   * against those same ids.
   */
  await payload.updateGlobal({
    slug: 'currently',
    locale: 'en',
    data: {
      updatedLabel: currentlyUpdated,
      items: existingCurrently.map((item) => ({
        kind: item.kind,
        value: resolveText(item.value, 'en'),
        href: item.href ?? undefined,
      })),
    } as never,
  })

  const createdCurrently = (await payload.findGlobal({
    slug: 'currently',
    locale: 'en',
  })) as { items?: { id?: string }[] }

  const rowIds = (createdCurrently.items ?? []).map((row) => row.id)

  for (const locale of LOCALES) {
    if (locale === 'en') continue
    await payload.updateGlobal({
      slug: 'currently',
      locale,
      data: {
        items: existingCurrently.map((item, i) => ({
          id: rowIds[i],
          kind: item.kind,
          value: resolveText(item.value, locale),
          href: item.href ?? undefined,
        })),
      } as never,
    })
  }

  console.info('  ✓ Currently global updated')

  // ── Seed SiteSettings (Global) ──
  console.info('[seed] Seeding SiteSettings global...')

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'Denis Mitrović',
      tagline: 'Ideas, made real.',
    } as never,
  })

  console.info('  ✓ SiteSettings global updated')

  // ── Summary ──
  const projectCount = await payload.count({ collection: 'projects' })
  const experimentCount = await payload.count({ collection: 'experiments' })

  console.info('\n[seed] Done!')
  console.info(`  Projects:    ${projectCount.totalDocs}`)
  console.info(`  Experiments: ${experimentCount.totalDocs}`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
