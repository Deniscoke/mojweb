/**
 * Project data layer.
 *
 * Source is decided once per build by `resolveContentSource()`. When that
 * answer is `payload`, these functions return Payload content even if it is
 * empty — quietly topping up from the local files would produce exactly the
 * hybrid build this layer exists to prevent.
 */

import { cmsGet } from './client';
import { normalizeProject } from './normalize';
import { usingPayload } from './source';
import type { PayloadProject, PayloadListResponse } from './types';
import type { Project } from '~/data/projects';

import { projects as localProjects } from '~/data/projects';

export async function getProjects(locale: string): Promise<Project[]> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<PayloadProject>>('projects', {
      locale,
      limit: 500,
      sort: 'order',
      depth: 1,
    });

    return (res?.docs ?? []).map(normalizeProject);
  }

  return localProjects;
}

export async function getFeaturedProjects(locale: string): Promise<Project[]> {
  return (await getProjects(locale)).filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string, locale: string): Promise<Project | undefined> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<PayloadProject>>('projects', {
      locale,
      limit: 1,
      depth: 1,
      where: { slug: { equals: slug } },
    });

    const doc = res?.docs?.[0];
    return doc ? normalizeProject(doc) : undefined;
  }

  return localProjects.find((p) => p.slug === slug);
}

/** The next project in display order, wrapping at the end of the list. */
export async function getNeighbourProject(slug: string, locale: string): Promise<Project | undefined> {
  const all = await getProjects(locale);
  if (all.length === 0) return undefined;

  const i = all.findIndex((p) => p.slug === slug);
  return i >= 0 ? all[(i + 1) % all.length] : all[0];
}
