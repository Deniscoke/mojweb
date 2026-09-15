import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Projects } from './collections/Projects'
import { Experiments } from './collections/Experiments'
import { Media } from './collections/Media'
import { Currently } from './globals/Currently'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — IRL CMS',
    },
  },

  editor: lexicalEditor(),

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
  }),

  collections: [Users, Projects, Experiments, Media],
  globals: [Currently, SiteSettings],

  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Čeština', code: 'cs' },
      { label: 'Slovenčina', code: 'sk' },
      { label: 'Español', code: 'es' },
      { label: 'Srpski (Latin)', code: 'sr' },
      { label: 'Türkçe', code: 'tr' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  cors: [
    'http://localhost:4321',
    process.env.SITE_PRODUCTION_URL,
  ].filter(Boolean) as string[],

  csrf: [
    'http://localhost:4321',
    process.env.SITE_PRODUCTION_URL,
  ].filter(Boolean) as string[],

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
})
