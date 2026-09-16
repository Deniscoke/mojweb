/**
 * MEDIA IMPORT — real evidence into the Payload Media collection.
 *
 *   npm run media:import
 *
 * Idempotent: matched by filename, so re-running updates metadata and
 * re-attaches rather than duplicating.
 *
 * Every `alt` in the list describes what is actually visible in that specific
 * file. None of it is derived from a filename, and nothing there describes an
 * image that does not exist. Assets whose provenance could not be confirmed,
 * or that would need redaction, are not listed — see `docs/assets-found.md`.
 */

import 'dotenv/config'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { EVIDENCE, type EvidenceSpec } from '../../../src/data/evidence'

const EVIDENCE_DIR = path.resolve(process.cwd(), '..', 'artifacts', 'evidence-ready')

/**
 * The list itself lives in src/data/evidence.ts, because the static site needs
 * it too: without Payload it attaches the same files from public/media/
 * evidence/ (see src/lib/cms/evidence.ts). One list, two consumers, no drift.
 */
export const mediaSpecs: EvidenceSpec[] = EVIDENCE

async function findMediaByFilename(payload: Payload, filename: string) {
  const res = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })
  return res.docs[0]
}

async function main() {
  const payload = await getPayload({ config })

  console.log(`\n[media] Importing ${mediaSpecs.length} evidence files from ${EVIDENCE_DIR}`)

  /** project slug -> media ids, in the order declared above. */
  const byProject = new Map<string, { order: number; id: number }[]>()

  for (const spec of mediaSpecs) {
    const filePath = path.join(EVIDENCE_DIR, spec.file)

    let doc = await findMediaByFilename(payload, spec.file)

    if (!doc) {
      doc = await payload.create({
        collection: 'media',
        filePath,
        locale: 'en',
        overrideAccess: true,
        data: { kind: spec.kind, alt: spec.alt.en, caption: spec.caption?.en, credit: spec.credit },
      })
      console.log(`  + created  ${spec.file}`)
    } else {
      await payload.update({
        collection: 'media',
        id: doc.id,
        locale: 'en',
        overrideAccess: true,
        data: { kind: spec.kind, alt: spec.alt.en, caption: spec.caption?.en, credit: spec.credit },
      })
      console.log(`  ~ updated  ${spec.file}`)
    }

    // Localised alt and caption.
    for (const locale of ['cs', 'sk'] as const) {
      await payload.update({
        collection: 'media',
        id: doc.id,
        locale,
        overrideAccess: true,
        data: { alt: spec.alt[locale], caption: spec.caption?.[locale] },
      })
    }

    const list = byProject.get(spec.project) ?? []
    list.push({ order: spec.order, id: doc.id as number })
    byProject.set(spec.project, list)
  }

  console.log('\n[media] Attaching to projects...')
  for (const [slug, items] of byProject) {
    const res = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    })
    const project = res.docs[0]
    if (!project) {
      console.warn(`  ! project not found: ${slug}`)
      continue
    }

    const ordered = items.sort((a, b) => a.order - b.order).map((i) => i.id)
    await payload.update({
      collection: 'projects',
      id: project.id,
      overrideAccess: true,
      data: { media: ordered, _status: 'published' },
    })
    console.log(`  ✓ ${slug}: ${ordered.length} item(s)`)
  }

  console.log('\n[media] Done.')
  process.exit(0)
}

void main()
