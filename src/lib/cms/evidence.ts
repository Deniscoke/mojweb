/**
 * Local evidence for the fallback content source.
 *
 * When Payload is not running (every Vercel build today), projects and lab
 * notes come from src/data/generated/, which carries no media. Their real
 * artefacts are attached here from src/data/evidence.ts, the same list the CMS
 * imports, so the fallback site shows the same screenshots and diagrams the
 * CMS-backed site would — and still nothing that is not real.
 */

import { EVIDENCE } from '~/data/evidence';
import type { MediaItem } from '~/data/projects';

const MIME: Record<string, string> = {
  webp: 'image/webp',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
};

function pick(text: Record<'en' | 'cs' | 'sk', string> | undefined, locale: string): string | null {
  if (!text) return null;
  // Evidence text exists in EN/CS/SK. Other locales read the English original
  // rather than an invented translation.
  return (text as Record<string, string>)[locale] ?? text.en;
}

export function localEvidenceFor(slug: string, locale: string): MediaItem[] {
  return EVIDENCE.filter((spec) => spec.project === slug)
    .sort((a, b) => a.order - b.order)
    .map((spec) => ({
      id: `evidence-${spec.file}`,
      url: `/media/evidence/${spec.file}`,
      kind: spec.kind,
      mimeType: MIME[spec.file.split('.').pop() ?? ''] ?? '',
      width: spec.width,
      height: spec.height,
      alt: pick(spec.alt, locale),
      caption: pick(spec.caption, locale),
      credit: spec.credit ?? null,
    }));
}

/** Attaches local evidence to an item that has no media of its own. */
export function withLocalEvidence<T extends { slug?: string; id?: string; media?: MediaItem[] }>(
  item: T,
  locale: string,
): T {
  if (item.media && item.media.length > 0) return item;
  const key = item.slug ?? item.id;
  if (!key) return item;
  const media = localEvidenceFor(key, locale);
  return media.length > 0 ? { ...item, media } : item;
}
