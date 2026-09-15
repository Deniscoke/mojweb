/**
 * CONTENT IMPORT — Iteration 3 case studies and lab notes.
 *
 * Idempotent, like the seed: projects are matched by `slug` and experiments by
 * `identifier`, so re-running updates in place and never duplicates. It writes
 * through the Payload Local API — the SQLite file is never touched directly.
 *
 *   npm run content:import
 *
 * This is production content, not a test fixture. It is deliberately kept
 * separate from `src/test/fixtures/`.
 */

import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

import { rt, FULL_LOCALES, SHORT_LOCALES, type FullLocale, type AnyLocale } from './lexical'
import { projectContent } from './projects'
import { projectContent2 } from './projects2'
import { experimentContent } from './experiments'

const projects = [...projectContent, ...projectContent2]

/** Case-study prose exists in these locales; everything else falls back to EN. */
const WRITTEN_LOCALES = [...FULL_LOCALES]

/** SQLite ids are numeric; the relationship field expects that, not a string. */
async function findProjectId(payload: Payload, slug: string): Promise<number | null> {
  const res = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  const id = res.docs[0]?.id
  return typeof id === 'number' ? id : null
}

async function importProjects(payload: Payload): Promise<void> {
  console.log(`\n[content] Importing ${projects.length} case studies...`)

  for (const p of projects) {
    const id = await findProjectId(payload, p.slug)
    if (!id) {
      console.warn(`  ! Skipped ${p.slug} — not in CMS. Run "npm run seed" first.`)
      continue
    }

    // Short fields exist in every locale.
    for (const locale of [...FULL_LOCALES, ...SHORT_LOCALES] as AnyLocale[]) {
      const s = p.short[locale]
      await payload.update({
        collection: 'projects',
        id,
        locale,
        overrideAccess: true,
        data: {
          category: s.category,
          shortDescription: s.shortDescription,
          subtitle: s.subtitle,
          question: s.question,
          metaTitle: `${p.title} — Denis Mitrović`,
          metaDescription: s.shortDescription,
        },
      })
    }

    // Long-form prose only where it has actually been written.
    for (const locale of FULL_LOCALES) {
      const prose = p.prose[locale as FullLocale]
      await payload.update({
        collection: 'projects',
        id,
        locale,
        overrideAccess: true,
        data: {
          overview: prose.overview ? rt(prose.overview) : null,
          context: prose.context ? rt(prose.context) : null,
          idea: prose.idea ? rt(prose.idea) : null,
          process: prose.process ? rt(prose.process) : null,
          technology: prose.technology ? rt(prose.technology) : null,
          experiments: prose.experiments ? rt(prose.experiments) : null,
          currentState: prose.currentState ? rt(prose.currentState) : null,
          learning: prose.learning ? rt(prose.learning) : null,
        },
      })
    }

    // Locale-independent settings, written once.
    await payload.update({
      collection: 'projects',
      id,
      overrideAccess: true,
      data: {
        disciplines: p.disciplines,
        writtenLocales: WRITTEN_LOCALES,
        _status: 'published',
      },
    })

    console.log(`  ✓ ${p.slug}`)
  }
}

async function importExperiments(payload: Payload): Promise<void> {
  console.log(`\n[content] Importing ${experimentContent.length} lab notes...`)

  for (const e of experimentContent) {
    const res = await payload.find({
      collection: 'experiments',
      where: { identifier: { equals: e.identifier } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    })
    const doc = res.docs[0]
    if (!doc) {
      console.warn(`  ! Skipped ${e.identifier} — not in CMS. Run "npm run seed" first.`)
      continue
    }

    for (const locale of FULL_LOCALES) {
      const log = e.log[locale]
      await payload.update({
        collection: 'experiments',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: {
          question: e.question[locale],
          shortNote: log.shortNote ?? null,
          whatITried: log.whatITried ? rt(log.whatITried) : null,
          whatHappened: log.whatHappened ? rt(log.whatHappened) : null,
          nextQuestion: log.nextQuestion ? rt(log.nextQuestion) : null,
        },
      })
    }

    // The canonical half of the project ↔ experiment relationship.
    const relatedProjectId = e.relatedProject
      ? await findProjectId(payload, e.relatedProject)
      : null

    if (e.relatedProject && !relatedProjectId) {
      console.warn(`  ! ${e.identifier}: related project "${e.relatedProject}" not found`)
    }

    await payload.update({
      collection: 'experiments',
      id: doc.id,
      overrideAccess: true,
      data: {
        slug: e.slug,
        relatedProject: relatedProjectId,
        _status: 'published',
      },
    })

    const link = e.relatedProject ?? '—'
    console.log(`  ✓ ${e.identifier}  →  ${link}`)
  }
}

async function main() {
  const payload = await getPayload({ config })

  await importProjects(payload)
  await importExperiments(payload)

  const [p, x] = await Promise.all([
    payload.count({ collection: 'projects', overrideAccess: true }),
    payload.count({ collection: 'experiments', overrideAccess: true }),
  ])

  console.log('\n[content] Done.')
  console.log(`  Projects:    ${p.totalDocs}`)
  console.log(`  Experiments: ${x.totalDocs}`)
  process.exit(0)
}

void main()
