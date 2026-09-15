/* ============================================================================
 * TEST ONLY — DO NOT RUN AGAINST PRODUCTION.
 *
 * These scripts write throwaway documents into the CMS to prove the route
 * policy. They are not content and must never survive into a public build.
 * The production content importer is `src/content/import.ts`.
 * ==========================================================================*/

/**
 * PAYLOAD SOURCE PROOF — temporary marker.
 *
 * Writes a sentinel string into one project's English shortDescription in the
 * CMS only. If that string appears in the generated Astro HTML, the build read
 * from Payload rather than from the identical seeded local file.
 *
 *   npx tsx src/test/fixtures/sourceMarker.ts set
 *   npx tsx src/test/fixtures/sourceMarker.ts reset
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'

const SLUG = 'pravo365'
export const MARKER = 'PAYLOAD SOURCE VERIFICATION'

/** The seeded value, restored verbatim on reset. */
const ORIGINAL =
  'A digital product for drafting contract proposals for the Czech legal environment.'

async function run(value: string) {
  const payload = await getPayload({ config })

  const res = await payload.find({
    collection: 'projects',
    where: { slug: { equals: SLUG } },
    limit: 1,
    overrideAccess: true,
  })

  const doc = res.docs[0]
  if (!doc) throw new Error(`Project not found: ${SLUG}`)

  await payload.update({
    collection: 'projects',
    id: doc.id,
    data: { shortDescription: value },
    locale: 'en',
    overrideAccess: true,
  })

  console.log(`${SLUG}.shortDescription (en) = ${JSON.stringify(value)}`)
  process.exit(0)
}

const cmd = process.argv[2]
if (cmd === 'set') void run(MARKER)
else if (cmd === 'reset') void run(ORIGINAL)
else {
  console.error('Usage: tsx src/test/fixtures/sourceMarker.ts <set|reset>')
  process.exit(1)
}
