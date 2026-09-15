import type { ProjectVisual } from './projects';

/**
 * PROJECT LABS — structure only.
 * ==============================
 * What does not change between languages lives here: slugs, names, glyphs,
 * which formats fit, colour worlds and links to real work. Every sentence a
 * visitor reads lives in src/i18n/labs/<locale>.json, typed by `LabsCopy`, so a
 * language with a missing string fails `astro check` instead of shipping.
 *
 * Each lab carries its own colour world, taken from the printed poster family.
 * The colours are scoped to the lab (CSS custom properties on the card or page)
 * and never become global accents.
 */

export const LAB_SLUGS = ['ai-builder', 'unreal', 'usage', 'invok', 'future'] as const;
export type LabSlug = (typeof LAB_SLUGS)[number];

export interface LabWorld {
  /** Main accent, tuned to read on the dark site ground. */
  accent: string;
  /** Secondary accent for small details. */
  second: string;
  /** Poster family the colours come from. */
  palette: string;
}

export interface LabRelated {
  kind: 'project' | 'lab';
  slug: string;
}

export interface Lab {
  slug: LabSlug;
  /** Proper name, identical in every language. */
  name: string;
  glyph: string;
  /** Indexes into the formats list (copy.formats.items) that fit this lab. */
  formats: number[];
  online: boolean;
  visual: ProjectVisual;
  world: LabWorld;
  related: LabRelated[];
}

export const SCHOOL_YEAR = '2026/27';

/** The printed materials exist in Czech only; labels come from the copy. */
export const LAB_PDFS = {
  poster: '/assets/pdf/projektove-laby-nabidka-A4.pdf',
  cards: '/assets/pdf/projektove-laby-karty-A5.pdf',
};

export const LABS: Lab[] = [
  {
    slug: 'ai-builder',
    name: 'AI Builder Lab',
    glyph: '›_',
    formats: [0, 1, 2, 4],
    online: true,
    visual: 'strata',
    world: { accent: '#e8927f', second: '#f3eee8', palette: 'Salmon × black × warm neutral' },
    related: [
      { kind: 'project', slug: 'pravo365' },
      { kind: 'lab', slug: 'ai-commerce-engine' },
      { kind: 'lab', slug: 'generated-product-pipelines' },
    ],
  },
  {
    slug: 'unreal',
    name: 'Unreal AI Lab',
    glyph: '◇',
    formats: [1, 2, 3, 4],
    online: false,
    visual: 'orbit',
    world: { accent: '#d9566d', second: '#cfa33a', palette: 'Crimson × grey × mustard' },
    related: [
      { kind: 'project', slug: 'moodpack-director' },
      { kind: 'lab', slug: 'ai-controlling-unreal' },
      { kind: 'project', slug: 'circus-movement' },
      { kind: 'project', slug: 'snowboard-coaching' },
    ],
  },
  {
    slug: 'usage',
    name: 'Usage Lab',
    glyph: 'Σ',
    formats: [0, 1, 3],
    online: true,
    visual: 'scan',
    world: { accent: '#9fb39b', second: '#c08bb0', palette: 'Sage × plum' },
    related: [],
  },
  {
    slug: 'invok',
    name: 'Invok Lab',
    glyph: '↻',
    formats: [1, 2, 3, 4],
    online: true,
    visual: 'grid',
    world: { accent: '#e2448b', second: '#c4c25a', palette: 'Fuchsia × olive' },
    related: [
      { kind: 'lab', slug: 'art-learning' },
      { kind: 'lab', slug: 'drawing-as-daily-habit' },
    ],
  },
  {
    slug: 'future',
    name: 'Future Lab',
    glyph: '?',
    formats: [0, 1, 3],
    online: true,
    visual: 'flux',
    world: { accent: '#c08bb0', second: '#9fb39b', palette: 'Plum × sage' },
    related: [
      { kind: 'lab', slug: 'spatial-computing' },
      { kind: 'lab', slug: 'navigable-space' },
    ],
  },
];

export function getLab(slug: string): Lab | undefined {
  return LABS.find((lab) => lab.slug === slug);
}
