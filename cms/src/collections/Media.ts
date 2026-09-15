import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  upload: {
    staticDir: '../media',
    mimeTypes: [
      'image/*',
      'video/*',
      'application/pdf',
      'image/svg+xml',
    ],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'screenshot',
      options: [
        { label: 'Screenshot', value: 'screenshot' },
        { label: 'Diagram', value: 'diagram' },
        { label: 'Photo', value: 'photo' },
        { label: 'Generated visual', value: 'generated' },
        { label: 'Video', value: 'video' },
      ],
      admin: {
        description:
          'How the frontend should present this. Diagrams get a padded light frame; screenshots and photos are shown edge to edge.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: {
        description:
          'Describe what is actually visible, for people using a screen reader. Never the filename, never just "image".',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Attribution / source credit.',
      },
    },
  ],
}
