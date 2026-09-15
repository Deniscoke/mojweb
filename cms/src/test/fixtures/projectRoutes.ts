/* ============================================================================
 * TEST ONLY — DO NOT RUN AGAINST PRODUCTION.
 *
 * These scripts write throwaway documents into the CMS to prove the route
 * policy. They are not content and must never survive into a public build.
 * The production content importer is `src/content/import.ts`.
 * ==========================================================================*/

/**
 * INTEGRATION TEST FIXTURES — not part of the seed.
 *
 * Creates and removes two throwaway documents used to prove the route policy:
 * a published project that exists ONLY in the CMS (must gain a route) and a
 * draft project (must gain none). Neither is real portfolio content, so
 * `down` must be run before the site is published anywhere.
 *
 *   npx tsx src/test/fixtures/projectRoutes.ts up
 *   npx tsx src/test/fixtures/projectRoutes.ts down
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'

const PUBLISHED_SLUG = 'cms-route-test'
const DRAFT_SLUG = 'cms-draft-test'

async function findBySlug(payload: Awaited<ReturnType<typeof getPayload>>, slug: string) {
  const res = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0]
}

async function up() {
  const payload = await getPayload({ config })

  const fixtures = [
    {
      slug: PUBLISHED_SLUG,
      title: 'CMS Route Test',
      status: 'published' as const,
      shortDescription: 'Temporary fixture proving CMS-only projects receive a route.',
    },
    {
      slug: DRAFT_SLUG,
      title: 'CMS Draft Test',
      status: 'draft' as const,
      shortDescription: 'Temporary fixture proving drafts receive no public route.',
    },
  ]

  for (const f of fixtures) {
    const existing = await findBySlug(payload, f.slug)
    const data = {
      title: f.title,
      slug: f.slug,
      category: 'Test',
      shortDescription: f.shortDescription,
      status: ['experiment' as const],
      featured: false,
      order: 900,
      visual: 'grid' as const,
      hue: 200,
      _status: f.status,
    }

    if (existing) {
      await payload.update({
        collection: 'projects',
        id: existing.id,
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Updated  ${f.slug} (${f.status})`)
    } else {
      await payload.create({
        collection: 'projects',
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Created  ${f.slug} (${f.status})`)
    }
  }

  process.exit(0)
}

async function down() {
  const payload = await getPayload({ config })

  for (const slug of [PUBLISHED_SLUG, DRAFT_SLUG]) {
    const existing = await findBySlug(payload, slug)
    if (existing) {
      await payload.delete({ collection: 'projects', id: existing.id, overrideAccess: true })
      console.log(`Deleted  ${slug}`)
    } else {
      console.log(`Absent   ${slug}`)
    }
  }

  process.exit(0)
}

const cmd = process.argv[2]
if (cmd === 'up') void up()
else if (cmd === 'down') void down()
else {
  console.error('Usage: tsx src/test/fixtures/projectRoutes.ts <up|down>')
  process.exit(1)
}
