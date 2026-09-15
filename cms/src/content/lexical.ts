/**
 * Minimal Lexical document builder.
 *
 * Payload stores rich text as a Lexical tree. Authoring content as plain
 * paragraph arrays and converting here keeps the content files readable —
 * hand-writing Lexical JSON for five case studies in three languages would
 * bury the prose in structure.
 */

/**
 * Payload's generated rich-text type carries an index signature, which an
 * `interface` does not satisfy implicitly — hence a type alias.
 */
export type LexicalDoc = {
  [key: string]: unknown
  root: {
    [key: string]: unknown
    type: 'root'
    format: ''
    indent: 0
    version: 1
    direction: 'ltr'
    children: Record<string, unknown>[]
  }
}

export function rt(paragraphs: string[]): LexicalDoc {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        textFormat: 0,
        children: [
          {
            type: 'text',
            text,
            version: 1,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
          },
        ],
      })),
    },
  }
}

/** Locales that get full case-study prose in this iteration. */
export const FULL_LOCALES = ['en', 'cs', 'sk'] as const
export type FullLocale = (typeof FULL_LOCALES)[number]

/** Locales that get metadata and the driving question, but not long prose. */
export const SHORT_LOCALES = ['es', 'sr', 'tr'] as const
export type ShortLocale = (typeof SHORT_LOCALES)[number]

export type AnyLocale = FullLocale | ShortLocale

/** The long-form fields of a case study, per locale. */
export interface CaseStudyProse {
  overview?: string[]
  context?: string[]
  idea?: string[]
  process?: string[]
  technology?: string[]
  experiments?: string[]
  currentState?: string[]
  learning?: string[]
}

/** Short fields exist in every locale; prose only in the full ones. */
export interface ProjectContent {
  slug: string
  title: string
  disciplines: string[]
  short: Record<AnyLocale, { category: string; shortDescription: string; subtitle: string; question: string }>
  prose: Record<FullLocale, CaseStudyProse>
}
