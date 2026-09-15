/**
 * Payload REST API response shapes.
 *
 * These are the RAW Payload response types — NOT the Astro view models.
 * The normalize module transforms these into the existing Project/Experiment types.
 */

export interface PayloadDoc {
  id: number | string
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published'
}

export interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// ── Payload Project document ──

export interface PayloadProject extends PayloadDoc {
  title: string
  slug: string
  category?: string
  shortDescription?: string
  subtitle?: string
  question?: string
  disciplines?: string[] | null
  overview?: unknown
  context?: unknown
  idea?: unknown
  process?: unknown
  technology?: unknown
  experiments?: unknown
  currentState?: unknown
  learning?: unknown
  practice?: unknown
  people?: unknown
  availability?: unknown
  status: string[]
  featured: boolean
  order: number
  year?: number
  externalUrl?: string
  visual: string
  hue: number
  writtenLocales?: string[] | null
  media?: PayloadMedia[]
  metaTitle?: string
  metaDescription?: string
  ogImage?: PayloadMedia
}

// ── Payload Experiment document ──

export interface PayloadExperiment extends PayloadDoc {
  identifier: string
  title: string
  slug: string
  question?: string
  shortNote?: string
  tag?: string
  status: string
  featured: boolean
  order: number
  whatITried?: unknown
  whatHappened?: unknown
  nextQuestion?: unknown
  relatedProject?: Pick<PayloadProject, 'slug' | 'title'> | number | null
  media?: PayloadMedia[]
  metaTitle?: string
  metaDescription?: string
  ogImage?: PayloadMedia
}

// ── Payload Media document ──

export interface PayloadMedia extends PayloadDoc {
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
  kind?: 'screenshot' | 'diagram' | 'photo' | 'generated' | 'video'
  alt?: string
  caption?: string
  credit?: string
}

// ── Payload Currently global ──

export interface PayloadCurrently {
  updatedLabel?: string
  items?: Array<{
    kind: string
    value: string
    href?: string
  }>
}

// ── Payload SiteSettings global ──

export interface PayloadSiteSettings {
  brandName?: string
  tagline?: string
  email?: string
  linkedin?: string
  github?: string
  instagram?: string
  productionSiteUrl?: string
  defaultOGImage?: PayloadMedia
}
