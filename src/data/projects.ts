import type { LocalizedText } from '~/i18n/text';
import { projectsData } from './generated/projects.data';

/**
 * SELECTED WORK
 * -------------
 * Add a project = add an entry here. Nothing else needs to change.
 *
 * Rules: no invented metrics, clients, awards or revenue. If a fact was not
 * given, it is not here. `href: null` renders a non-linked card instead of a
 * dead link.
 */

/**
 * `ongoing` covers work that is a continuing practice rather than a thing being
 * built towards a release — the software ladder does not describe it.
 */
export type ProjectStatus = 'live' | 'in-development' | 'prototype' | 'experiment' | 'ongoing';

/** Procedural placeholder art. No stock photography, no empty grey boxes. */
export type ProjectVisual = 'strata' | 'orbit' | 'grid' | 'scan' | 'flux';

/** Standard case-study sections. Headings come from the dictionaries. */
export type DetailSectionId =
  | 'overview'
  | 'context'
  | 'idea'
  | 'process'
  | 'technology'
  | 'experiments'
  | 'state'
  | 'learning'
  /** Profile sections, for practices rather than software projects. */
  | 'practice'
  | 'people'
  | 'availability';

export interface DetailSection {
  id: DetailSectionId;
  body: LocalizedText[];
}

/**
 * A piece of evidence attached to a project or experiment. `kind` decides how
 * it is framed, not what it is: a diagram gets breathing room, a screenshot
 * runs edge to edge.
 */
export type MediaKind = 'screenshot' | 'diagram' | 'photo' | 'generated' | 'video';

export interface MediaItem {
  id: string;
  url: string;
  kind: MediaKind;
  mimeType: string;
  width: number | null;
  height: number | null;
  /** Null when no real alt text was written. Never auto-filled. */
  alt: string | null;
  caption: string | null;
  credit: string | null;
}

export interface ProjectDetail {
  subtitle: LocalizedText;
  /** The one question the project exists to answer. */
  question?: LocalizedText;
  /** Short factual tags. Never a stack we have not been told about. */
  disciplines: string[];
  sections: DetailSection[];
  /**
   * Locales whose case-study prose has actually been written. Anything else
   * falls back to English and says so, rather than pretending.
   */
  written: string[];
}

export interface Project {
  slug: string;
  /**
   * Brand names stay identical across locales; descriptive names are
   * translated, so this is localizable.
   */
  title: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  status: ProjectStatus[];
  href: string | null;
  visual: ProjectVisual;
  /** 0–360, drives the generated visual + hover accent. */
  hue: number;
  featured: boolean;
  /** Year the work started. Null when not recorded. */
  year?: number | null;
  /** Evidence. Empty when nothing has been captured yet — never a placeholder. */
  media?: MediaItem[];
  /** Present = a full case study. Absent = the short project page. */
  detail?: ProjectDetail;
}

/** How far along a project is, used to order and to style the status. */
export const STATUS_RANK: Record<ProjectStatus, number> = {
  /** Not a rung on the ladder — an established practice, so it reads as full. */
  ongoing: 4,
  experiment: 1,
  prototype: 2,
  'in-development': 3,
  live: 4,
};

export function maturityOf(project: Project): number {
  return Math.max(...project.status.map((s) => STATUS_RANK[s]));
}

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function neighbourOf(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length]!;
}

/**
 * Fallback content. Generated from Payload — see
 * `src/data/generated/projects.data.ts`. Types and helpers above are
 * hand-written and are the contract the rest of the site codes against.
 */
export const projects: Project[] = projectsData;

export const featuredProjects = projects.filter((p) => p.featured);
