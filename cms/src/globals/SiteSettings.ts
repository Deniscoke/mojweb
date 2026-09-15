import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      admin: {
        description: 'Site brand name. Currently "Denis Mitrović".',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'linkedin',
      type: 'text',
    },
    {
      name: 'github',
      type: 'text',
    },
    {
      name: 'instagram',
      type: 'text',
    },
    {
      name: 'defaultOGImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'productionSiteUrl',
      type: 'text',
      admin: {
        description: 'Not used by the site build. The canonical domain comes from the SITE_URL env variable (see .env.example).',
      },
    },
  ],
}
