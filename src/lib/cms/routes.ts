/**
 * ROUTE SOURCE — which slugs get a static page.
 *
 * This is the piece that makes Payload canonical rather than decorative. When
 * Payload is the resolved source, the set of published documents in the CMS
 * decides which routes exist, so a project created only in the admin gets its
 * own public page on the next build without any source edit.
 *
 * Slugs are not localized in Payload, so one query serves every locale.
 */

import { cmsGet } from './client';
import { usingPayload } from './source';
import type { PayloadListResponse, PayloadProject, PayloadExperiment } from './types';

import { projects as localProjects } from '~/data/projects';
import { experiments as localExperiments } from '~/data/experiments';

/**
 * Published project slugs, in display order. Drafts are excluded by `cmsGet`,
 * which forces `_status=published` on every query.
 */
export async function getProjectRouteSlugs(): Promise<string[]> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<Pick<PayloadProject, 'slug'>>>('projects', {
      limit: 500,
      depth: 0,
      sort: 'order',
    });

    if (res?.docs?.length) {
      return res.docs.map((d) => d.slug).filter(Boolean);
    }
  }

  return localProjects.map((p) => p.slug);
}

/**
 * Published experiment slugs. Iteration 3 builds `/[lang]/lab/[slug]/` on top
 * of this; the route policy is already identical to projects.
 */
export async function getExperimentRouteSlugs(): Promise<string[]> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<Pick<PayloadExperiment, 'slug' | 'identifier'>>>(
      'experiments',
      { limit: 500, depth: 0, sort: 'order' },
    );

    if (res?.docs?.length) {
      return res.docs.map((d) => d.slug || d.identifier).filter(Boolean);
    }
  }

  return localExperiments.map((e) => e.id);
}
