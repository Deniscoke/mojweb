import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'featured', 'order', '_status'],
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
    // ─── CONTENT ───
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description:
                  'Brand names (Pravo365, Moodpack / Director) stay identical in every locale. Descriptive names are translated.',
              },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'URL-safe identifier. Stable across locales.',
              },
            },
            {
              name: 'category',
              type: 'text',
              localized: true,
              admin: {
                description: 'e.g. "LegalTech / AI / Product"',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'subtitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Case study subtitle. Optional.',
              },
            },
            {
              name: 'question',
              type: 'textarea',
              localized: true,
              admin: {
                description:
                  'The one question this project exists to answer. Rendered as a large pull quote. Keep it a real question, not a slogan.',
              },
            },
            {
              name: 'disciplines',
              type: 'json',
              admin: {
                description: 'JSON array of discipline strings, e.g. ["LegalTech","AI","Product","UX"]',
              },
            },
            {
              name: 'overview',
              type: 'richText',
              localized: true,
            },
            {
              name: 'context',
              type: 'richText',
              localized: true,
            },
            {
              name: 'idea',
              type: 'richText',
              localized: true,
            },
            {
              name: 'process',
              type: 'richText',
              localized: true,
            },
            {
              name: 'technology',
              type: 'richText',
              localized: true,
            },
            {
              name: 'experiments',
              type: 'richText',
              localized: true,
              admin: {
                description: 'Experiments section for the case study.',
              },
            },
            {
              name: 'currentState',
              type: 'richText',
              localized: true,
            },
            {
              name: 'learning',
              type: 'richText',
              localized: true,
            },
            // ── Profile sections. Used by the practice-shaped entries
            // (circus, snowboarding, web work) where the software case-study
            // headings do not describe what is on the page.
            {
              name: 'practice',
              type: 'richText',
              localized: true,
              admin: { description: 'What it involves — the actual content of the work.' },
            },
            {
              name: 'people',
              type: 'richText',
              localized: true,
              admin: { description: 'Who it is for, and where.' },
            },
            {
              name: 'availability',
              type: 'richText',
              localized: true,
              admin: { description: 'What someone can actually book or ask for.' },
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'status',
              type: 'select',
              hasMany: true,
              required: true,
              options: [
                { label: 'Experiment', value: 'experiment' },
                { label: 'Prototype', value: 'prototype' },
                { label: 'In Development', value: 'in-development' },
                { label: 'Live', value: 'live' },
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
              admin: {
                description: 'Display order. Lower = first.',
              },
            },
            {
              name: 'year',
              type: 'number',
              admin: {
                description: 'Year the project started.',
              },
            },
            {
              name: 'externalUrl',
              type: 'text',
              admin: {
                description: 'Link to live product or demo. Leave empty if none.',
              },
            },
            {
              name: 'visual',
              type: 'select',
              required: true,
              defaultValue: 'strata',
              options: [
                { label: 'Strata', value: 'strata' },
                { label: 'Orbit', value: 'orbit' },
                { label: 'Grid', value: 'grid' },
                { label: 'Scan', value: 'scan' },
                { label: 'Flux', value: 'flux' },
              ],
            },
            {
              name: 'hue',
              type: 'number',
              min: 0,
              max: 360,
              defaultValue: 0,
              admin: {
                description: 'Hue (0–360) for the generated visual plate.',
              },
            },
            {
              name: 'writtenLocales',
              type: 'json',
              admin: {
                description: 'JSON array of locale codes with completed case study prose, e.g. ["en","cs","sk"]',
              },
            },
          ],
        },
        {
          label: 'Relationships',
          fields: [
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
