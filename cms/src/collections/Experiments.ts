import type { CollectionConfig } from 'payload'

export const Experiments: CollectionConfig = {
  slug: 'experiments',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['identifier', 'title', 'status', 'order', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'identifier',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'Stable machine ID, e.g. "ai-unreal". Used for upsert and relationships.',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Usually phrased as a question.',
              },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'URL-safe identifier for future detail routes.',
              },
            },
            {
              name: 'question',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'The driving question behind this experiment.',
              },
            },
            {
              name: 'shortNote',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'tag',
              type: 'text',
              admin: {
                description: 'Short technical tag, e.g. "AI × 3D". Not translated.',
              },
            },
            {
              name: 'whatITried',
              type: 'richText',
              localized: true,
            },
            {
              name: 'whatHappened',
              type: 'richText',
              localized: true,
            },
            {
              name: 'nextQuestion',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              options: [
                { label: 'Open Question', value: 'open-question' },
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Ongoing', value: 'ongoing' },
              ],
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'order',
              type: 'number',
              defaultValue: 0,
            },
          ],
        },
        {
          label: 'Relationships',
          fields: [
            {
              name: 'relatedProject',
              type: 'relationship',
              relationTo: 'projects',
              admin: {
                description: 'The project this experiment belongs to, if any.',
              },
            },
            {
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              localized: true,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
  ],
}
