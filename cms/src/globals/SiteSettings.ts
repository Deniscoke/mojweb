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
        description: 'Working brand name. Currently "IRL".',
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
        description: 'The canonical domain, e.g. https://denismitrovic.com',
      },
    },
  ],
}
