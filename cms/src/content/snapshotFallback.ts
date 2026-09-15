/**
 * FALLBACK SNAPSHOT — Payload → src/data/generated/*.
 *
 *   npm run cms:snapshot-fallback      (from the repo root)
 *
 * ONE WAY ONLY. Payload is canonical; this writes a frozen copy of the
 * currently published content so a CMS-off build still produces the same
 * information architecture instead of whatever the files last happened to say.
 *
 * There is no reverse direction, by design. `npm run seed` — which wrote
 * src/data back into Payload — is retired precisely because running both
 * would form a loop that quietly loses information.
 *
 * Not captured: media binaries. A fallback build renders no evidence images,
 * which is honest — the files live in the CMS and are copied into `dist/` by
 * the media-snapshot step of a CMS-on build.
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

const LOCALES = ['en', 'cs', 'sk', 'es', 'sr', 'tr'] as const
type Locale = (typeof LOCALES)[number]

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(HERE, '../../../src/data/generated')

const BANNER = `/* eslint-disable */
/**
 * ============================================================================
 * DO NOT EDIT MANUALLY
 * Generated from Payload canonical content by \`npm run cms:snapshot-fallback\`.
 *
 * This is the emergency fallback used when the CMS is unreachable at build
 * time. Editing it by hand creates a second database that will silently drift
 * from Payload. Change content in the Payload admin and regenerate.
 * ============================================================================
 */
`

/** Deterministic serialisation: sorted keys, stable quoting, no timestamps. */
function lit(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  const padIn = '  '.repeat(indent + 1)

  if (value === null || value === undefined) return 'null'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return JSON.stringify(value)

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return '[\n' + value.map((v) => padIn + lit(v, indent + 1)).join(',\n') + '\n' + pad + ']'
  }

  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined)
  if (keys.length === 0) return '{}'
  return (
    '{\n' +
    keys
      .map((k) => `${padIn}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${lit(obj[k], indent + 1)}`)
      .join(',\n') +
    '\n' +
    pad +
    '}'
  )
}

/**
 * Collapses a per-locale map into the LocalizedText shape: a bare string when
 * every locale agrees (brand names), an object otherwise. Locales identical to
 * English are dropped, since `t()` already falls back to it.
 */
function localized(byLocale: Partial<Record<Locale, string | null | undefined>>): unknown {
  const en = (byLocale.en ?? '').trim()
  const out: Record<string, string> = { en }
  let differs = false
  for (const l of LOCALES) {
    if (l === 'en') continue
    const v = (byLocale[l] ?? '').trim()
    if (v && v !== en) {
      out[l] = v
      differs = true
    }
  }
  return differs ? out : en
}

function paragraphs(rich: unknown): string[] {
  if (!rich || typeof rich !== 'object') return []
  const root = (rich as Record<string, unknown>).root as Record<string, unknown> | undefined
  const children = root?.children
  if (!Array.isArray(children)) return []
  const flatten = (n: unknown): string => {
    if (!n || typeof n !== 'object') return ''
    const o = n as Record<string, unknown>
    if (typeof o.text === 'string') return o.text
    if (Array.isArray(o.children)) return o.children.map(flatten).join('')
    return ''
  }
  return children.map(flatten).map((s) => s.trim()).filter(Boolean)
}

const SECTION_FIELDS: Array<[string, string]> = [
  ['overview', 'overview'],
  ['context', 'context'],
  ['practice', 'practice'],
  ['idea', 'idea'],
  ['process', 'process'],
  ['technology', 'technology'],
  ['experiments', 'experiments'],
  ['people', 'people'],
  ['state', 'currentState'],
  ['learning', 'learning'],
  ['availability', 'availability'],
]

type ByLocale<T> = Record<Locale, T>

async function fetchAllLocales<T>(
  load: (locale: Locale) => Promise<T>,
): Promise<ByLocale<T>> {
  const out = {} as ByLocale<T>
  for (const l of LOCALES) out[l] = await load(l)
  return out
}

async function snapshotProjects(payload: Payload): Promise<number> {
  const byLocale = await fetchAllLocales((locale) =>
    payload.find({
      collection: 'projects',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      sort: 'order',
      locale,
      overrideAccess: true,
    }),
  )

  const base = byLocale.en.docs
  const pick = (slug: string, l: Locale) =>
    byLocale[l].docs.find((d) => (d as { slug?: string }).slug === slug) as Record<string, unknown> | undefined

  const projects = base.map((doc) => {
    const d = doc as unknown as Record<string, unknown>
    const slug = d.slug as string
    const per = (field: string) =>
      localized(Object.fromEntries(LOCALES.map((l) => [l, pick(slug, l)?.[field] as string | undefined])) as Partial<Record<Locale, string>>)

    const sections = SECTION_FIELDS.flatMap(([id, field]) => {
      const enParas = paragraphs(pick(slug, 'en')?.[field])
      if (!enParas.length) return []
      const body = enParas.map((_, i) =>
        localized(
          Object.fromEntries(
            LOCALES.map((l) => [l, paragraphs(pick(slug, l)?.[field])[i]]),
          ) as Partial<Record<Locale, string>>,
        ),
      )
      return [{ id, body }]
    })

    const written = Array.isArray(d.writtenLocales) ? (d.writtenLocales as string[]) : ['en']

    const project: Record<string, unknown> = {
      slug,
      title: per('title'),
      category: per('category'),
      description: per('shortDescription'),
      status: d.status,
      href: (d.externalUrl as string) || null,
      visual: d.visual,
      hue: d.hue ?? 0,
      featured: Boolean(d.featured),
    }
    if (d.year) project.year = d.year

    if (sections.length) {
      project.detail = {
        subtitle: per('subtitle'),
        question: per('question') || undefined,
        disciplines: Array.isArray(d.disciplines) ? d.disciplines : [],
        sections,
        written,
      }
    }
    return project
  })

  const body =
    BANNER +
    "\nimport type { Project } from '../projects';\n\n" +
    'export const projectsData: Project[] = ' +
    lit(projects) +
    ';\n'

  await fs.writeFile(path.join(OUT_DIR, 'projects.data.ts'), body, 'utf8')
  return projects.length
}

async function snapshotExperiments(payload: Payload): Promise<number> {
  const byLocale = await fetchAllLocales((locale) =>
    payload.find({
      collection: 'experiments',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 1,
      sort: 'order',
      locale,
      overrideAccess: true,
    }),
  )

  const base = byLocale.en.docs
  const pick = (id: string, l: Locale) =>
    byLocale[l].docs.find((d) => (d as { identifier?: string }).identifier === id) as Record<string, unknown> | undefined

  const experiments = base.map((doc) => {
    const d = doc as unknown as Record<string, unknown>
    const id = d.identifier as string
    const per = (field: string) =>
      localized(Object.fromEntries(LOCALES.map((l) => [l, pick(id, l)?.[field] as string | undefined])) as Partial<Record<Locale, string>>)

    const log = (field: string) => {
      const enParas = paragraphs(pick(id, 'en')?.[field])
      if (!enParas.length) return undefined
      return enParas.map((_, i) =>
        localized(
          Object.fromEntries(LOCALES.map((l) => [l, paragraphs(pick(id, l)?.[field])[i]])) as Partial<Record<Locale, string>>,
        ),
      )
    }

    const rel = d.relatedProject
    const relatedProjectSlug =
      rel && typeof rel === 'object' && 'slug' in rel ? ((rel as { slug: string }).slug ?? null) : null

    const out: Record<string, unknown> = {
      id,
      slug: (d.slug as string) || id,
      title: per('title'),
      state: d.status,
      tag: (d.tag as string) ?? '',
    }
    const q = per('question')
    if (q) out.question = q
    const n = per('shortNote')
    if (n) out.shortNote = n
    const tried = log('whatITried')
    if (tried) out.whatITried = tried
    const happened = log('whatHappened')
    if (happened) out.whatHappened = happened
    const next = log('nextQuestion')
    if (next) out.nextQuestion = next
    if (relatedProjectSlug) out.relatedProjectSlug = relatedProjectSlug

    return out
  })

  const body =
    BANNER +
    "\nimport type { Experiment } from '../experiments';\n\n" +
    'export const experimentsData: Experiment[] = ' +
    lit(experiments) +
    ';\n'

  await fs.writeFile(path.join(OUT_DIR, 'experiments.data.ts'), body, 'utf8')
  return experiments.length
}

async function snapshotCurrently(payload: Payload): Promise<number> {
  const byLocale = await fetchAllLocales((locale) =>
    payload.findGlobal({ slug: 'currently', locale, overrideAccess: true }),
  )

  const en = byLocale.en as { updatedLabel?: string; items?: Array<Record<string, unknown>> }
  const items = (en.items ?? []).map((row, i) => {
    const value = localized(
      Object.fromEntries(
        LOCALES.map((l) => {
          const g = byLocale[l] as { items?: Array<Record<string, unknown>> }
          return [l, g.items?.[i]?.value as string | undefined]
        }),
      ) as Partial<Record<Locale, string>>,
    )
    return {
      id: (row.kind as string) || `item-${i}`,
      kind: row.kind,
      value,
      href: (row.href as string) || null,
    }
  })

  const body =
    BANNER +
    "\nimport type { CurrentlyItem } from '../currently';\n\n" +
    `export const currentlyUpdatedData = ${JSON.stringify(en.updatedLabel ?? '')};\n\n` +
    'export const currentlyData: CurrentlyItem[] = ' +
    lit(items) +
    ';\n'

  await fs.writeFile(path.join(OUT_DIR, 'currently.data.ts'), body, 'utf8')
  return items.length
}

async function main() {
  const payload = await getPayload({ config })

  console.log('\n[snapshot] Payload → src/data/generated (one way)')
  await fs.mkdir(OUT_DIR, { recursive: true })

  const p = await snapshotProjects(payload)
  const e = await snapshotExperiments(payload)
  const c = await snapshotCurrently(payload)

  console.log(`  projects.data.ts     ${p} published`)
  console.log(`  experiments.data.ts  ${e} published`)
  console.log(`  currently.data.ts    ${c} items`)
  console.log('\n[snapshot] Done. Drafts excluded; media not captured.')
  process.exit(0)
}

void main()
