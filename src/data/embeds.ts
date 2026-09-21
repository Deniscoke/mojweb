/**
 * EMBEDS — live, interactive scenes from other sites.
 * ==================================================
 * An embed is evidence you can use, not just look at: the Splatoo scene on the
 * Splatoo page is the actual product, running.
 *
 * Why a reviewed file in the repo and not a URL field in the CMS: an iframe
 * runs someone else's code inside this site. A free-text CMS field would let
 * anyone with admin access put any page in that frame. Here every embed is a
 * line in a commit, and its origin has to be on the allowlist below or the
 * build fails.
 *
 * Plain data with no imports, like evidence.ts.
 */

/** Origins allowed inside an iframe on this site. Add one only on purpose. */
export const EMBED_ORIGINS = ['https://app.splatoo.com'] as const;

export interface EmbedSpec {
  /** Project slug this belongs to. */
  project: string;
  /** Full https URL of the embeddable page. Its origin must be allowlisted. */
  src: string;
  /** Accessible name for the iframe. EN/CS/SK; other locales read English. */
  title: Record<'en' | 'cs' | 'sk', string>;
  caption?: Record<'en' | 'cs' | 'sk', string>;
  /** CSS aspect-ratio of the frame, e.g. '16 / 9'. */
  ratio: string;
}

export const EMBEDS: EmbedSpec[] = [
  {
    project: 'splatoo',
    src: 'https://app.splatoo.com/present/zdar-nad-sazavou',
    ratio: '16 / 9',
    title: {
      en: 'Interactive 3D scene of Žďár nad Sázavou, presented in Splatoo',
      cs: 'Interaktivní 3D scéna Žďáru nad Sázavou v Splatoo',
      sk: 'Interaktívna 3D scéna Žďáru nad Sázavou v Splatoo',
    },
    caption: {
      en: 'Žďár nad Sázavou, running live in Splatoo — the scene itself, not a recording of it.',
      cs: 'Žďár nad Sázavou, živě v Splatoo — samotná scéna, ne její záznam.',
      sk: 'Žďár nad Sázavou, naživo v Splatoo — samotná scéna, nie jej záznam.',
    },
  },
];

export function embedFor(slug: string): EmbedSpec | undefined {
  const spec = EMBEDS.find((e) => e.project === slug);
  if (!spec) return undefined;

  const origin = new URL(spec.src).origin;
  if (!(EMBED_ORIGINS as readonly string[]).includes(origin)) {
    throw new Error(`Embed for "${slug}" points at ${origin}, which is not in EMBED_ORIGINS.`);
  }
  return spec;
}
