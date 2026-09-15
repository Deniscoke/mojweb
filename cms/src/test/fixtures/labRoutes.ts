/* ============================================================================
 * TEST ONLY — DO NOT RUN AGAINST PRODUCTION.
 *
 * Creates a throwaway experiment that exists ONLY in the CMS, to prove the
 * Lab route policy the same way `projectRoutes.ts` proves it for projects:
 * a published CMS-only experiment must receive `/[lang]/lab/<slug>/` without
 * any source edit, and a draft must receive none.
 *
 * Always run `down` afterwards. These are not lab notes.
 *
 *   npm run test:cms-lab:up
 *   npm run test:cms-lab:down
 * ==========================================================================*/

import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../../payload.config'

const PUBLISHED = { identifier: 'cms-lab-test', slug: 'cms-lab-test' }
const DRAFT = { identifier: 'cms-lab-draft', slug: 'cms-lab-draft' }

async function find(payload: Payload, identifier: string) {
  const res = await payload.find({
    collection: 'experiments',
    where: { identifier: { equals: identifier } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0]
}

async function up() {
  const payload = await getPayload({ config })

  const fixtures = [
    { ...PUBLISHED, title: 'CMS Lab Route Test', status: 'published' as const },
    { ...DRAFT, title: 'CMS Lab Draft Test', status: 'draft' as const },
  ]

  for (const f of fixtures) {
    const existing = await find(payload, f.identifier)

    const data = {
      identifier: f.identifier,
      slug: f.slug,
      title: f.title,
      tag: 'Test',
      status: 'open-question' as const,
      order: 900,
      // A written log is what earns a detail route, so the fixture needs one.
      question: 'Temporary fixture proving CMS-only experiments receive a route.',
      whatHappened: {
        root: {
          type: 'root',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          children: [
            {
              type: 'paragraph',
              version: 1,
              format: '' as const,
              indent: 0,
              direction: 'ltr' as const,
              children: [
                {
                  type: 'text',
                  text: 'Temporary fixture. Remove with test:cms-lab:down.',
                  version: 1,
                  format: 0,
                  style: '',
                  mode: 'normal',
                  detail: 0,
                },
              ],
            },
          ],
        },
      },
      _status: f.status,
    }

    if (existing) {
      await payload.update({
        collection: 'experiments',
        id: existing.id,
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Updated  ${f.identifier} (${f.status})`)
    } else {
      await payload.create({
        collection: 'experiments',
        data,
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Created  ${f.identifier} (${f.status})`)
    }
  }

  process.exit(0)
}

async function down() {
  const payload = await getPayload({ config })

  for (const { identifier } of [PUBLISHED, DRAFT]) {
    const existing = await find(payload, identifier)
    if (existing) {
      await payload.delete({ collection: 'experiments', id: existing.id, overrideAccess: true })
      console.log(`Deleted  ${identifier}`)
    } else {
      console.log(`Absent   ${identifier}`)
    }
  }

  process.exit(0)
}

const cmd = process.argv[2]
if (cmd === 'up') void up()
else if (cmd === 'down') void down()
else {
  console.error('Usage: tsx src/test/fixtures/labRoutes.ts <up|down>')
  process.exit(1)
}
