import type { GlobalConfig } from 'payload'

export const Currently: GlobalConfig = {
  slug: 'currently',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'updatedLabel',
      type: 'text',
      admin: {
        description: 'Timestamp label, e.g. "2026-08". Shown on the homepage.',
      },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Building', value: 'building' },
            { label: 'Exploring', value: 'exploring' },
            { label: 'Experimenting', value: 'experimenting' },
            { label: 'Thinking', value: 'thinking' },
          ],
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            description: 'Optional link.',
          },
        },
      ],
    },
  ],
}
