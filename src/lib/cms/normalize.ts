/**
 * Normalize Payload documents into Astro view models.
 *
 * The frontend consumes the same types either way (Project, Experiment,
 * CurrentlyItem, MediaItem), so no component ever learns whether the build
 * was CMS-sourced or fallback-sourced.
 */

import type {
  Project,
  ProjectStatus,
  ProjectVisual,
  DetailSection,
  DetailSectionId,
  MediaItem,
  MediaKind,
} from '~/data/projects';
import type { Experiment, ExperimentState } from '~/data/experiments';
import type { CurrentlyItem, CurrentlyKind } from '~/data/currently';
import type { PayloadProject, PayloadExperiment, PayloadCurrently, PayloadMedia } from './types';
import { CMS_URL } from './source';

/**
 * Lexical stores a document as a tree of blocks. Flattening the whole tree
 * into one string would run every paragraph of a case study together, so the
 * top-level children are extracted individually and each becomes its own
 * rendered `<p>`.
 */
function richTextToParagraphs(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value !== 'object') return [];

  const root = (value as Record<string, unknown>).root;
  if (!root || typeof root !== 'object') return [];

  const children = (root as Record<string, unknown>).children;
  if (!Array.isArray(children)) return [];

  return children.map(flattenInline).map((s) => s.trim()).filter(Boolean);
}

/** Collapses one block's inline content — text runs, links, formatting. */
function flattenInline(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.children)) return n.children.map(flattenInline).join('');
  return '';
}

function isMediaDoc(value: unknown): value is PayloadMedia {
  return Boolean(value) && typeof value === 'object' && 'url' in (value as object);
}

/**
 * The built site must not depend on the CMS being up, so uploads are referenced
 * by a stable local path and the actual files are copied into `dist/media/`
 * after the build by the `media-snapshot` integration.
 *
 * This scheme is the one place the two halves have to agree — keep it in sync
 * with `localName()` in `integrations/media-snapshot.mjs`.
 */
export function localMediaPath(id: string | number, filename: string): string {
  const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  return `/media/${id}-${safe}`;
}

/**
 * `alt` stays null when nothing was written — an invented description of an
 * image nobody has seen is worse than no description at all.
 */
function normalizeMedia(value: unknown): MediaItem | null {
  if (!isMediaDoc(value)) return null;

  const url = value.filename
    ? localMediaPath(value.id, value.filename)
    : value.url.startsWith('http')
      ? value.url
      : `${CMS_URL}${value.url}`;

  const mimeType = value.mimeType ?? '';

  const kind: MediaKind =
    (value as PayloadMedia & { kind?: MediaKind }).kind ??
    (mimeType.startsWith('video/') ? 'video' : 'screenshot');

  return {
    id: String(value.id),
    url,
    kind,
    mimeType,
    width: value.width ?? null,
    height: value.height ?? null,
    alt: value.alt?.trim() || null,
    caption: value.caption?.trim() || null,
    credit: value.credit?.trim() || null,
  };
}

function normalizeMediaList(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeMedia).filter((m): m is MediaItem => m !== null);
}

export function normalizeProject(doc: PayloadProject): Project {
  const sectionFields: Array<[DetailSectionId, keyof PayloadProject]> = [
    ['overview', 'overview'],
    ['context', 'context'],
    // `practice` sits early: on a profile page it is the substance, and on a
    // case study it is simply absent.
    ['practice', 'practice'],
    ['idea', 'idea'],
    ['process', 'process'],
    ['technology', 'technology'],
    ['experiments', 'experiments'],
    ['people', 'people'],
    ['state', 'currentState'],
    ['learning', 'learning'],
    ['availability', 'availability'],
  ];

  const sections: DetailSection[] = [];
  for (const [id, field] of sectionFields) {
    const body = richTextToParagraphs(doc[field]);
    if (body.length) sections.push({ id, body });
  }

  const project: Project = {
    slug: doc.slug,
    title: doc.title,
    category: doc.category ?? '',
    description: doc.shortDescription ?? '',
    status: (doc.status ?? []) as ProjectStatus[],
    href: doc.externalUrl || null,
    visual: (doc.visual || 'strata') as ProjectVisual,
    hue: doc.hue ?? 0,
    featured: doc.featured ?? false,
    year: doc.year ?? null,
    media: normalizeMediaList(doc.media),
  };

  // A project without written sections renders the short model, not an
  // empty case study scaffold.
  if (sections.length > 0) {
    project.detail = {
      subtitle: doc.subtitle ?? '',
      question: doc.question || undefined,
      disciplines: Array.isArray(doc.disciplines) ? doc.disciplines : [],
      sections,
      written: Array.isArray(doc.writtenLocales) ? doc.writtenLocales : ['en'],
    };
  }

  return project;
}

export function normalizeExperiment(doc: PayloadExperiment): Experiment {
  const related = doc.relatedProject;
  const relatedProjectSlug =
    related && typeof related === 'object' && 'slug' in related ? related.slug : null;

  return {
    id: doc.identifier,
    slug: doc.slug || doc.identifier,
    title: doc.title,
    state: doc.status as ExperimentState,
    tag: doc.tag ?? '',
    question: doc.question || undefined,
    shortNote: doc.shortNote || undefined,
    whatITried: richTextToParagraphs(doc.whatITried),
    whatHappened: richTextToParagraphs(doc.whatHappened),
    nextQuestion: richTextToParagraphs(doc.nextQuestion),
    relatedProjectSlug,
    media: normalizeMediaList(doc.media),
  };
}

export function normalizeCurrently(doc: PayloadCurrently): {
  items: CurrentlyItem[];
  updatedLabel: string;
} {
  const items: CurrentlyItem[] = (doc.items ?? []).map((item, i) => ({
    id: item.kind || `item-${i}`,
    kind: item.kind as CurrentlyKind,
    value: item.value ?? '',
    href: item.href || null,
  }));

  return { items, updatedLabel: doc.updatedLabel ?? '' };
}
