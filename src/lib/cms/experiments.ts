/**
 * Experiment data layer. Same source policy as projects.
 */

import { cmsGet } from './client';
import { normalizeExperiment } from './normalize';
import { usingPayload } from './source';
import type { PayloadExperiment, PayloadListResponse } from './types';
import type { Experiment } from '~/data/experiments';

import { experiments as localExperiments } from '~/data/experiments';

export async function getExperiments(locale: string): Promise<Experiment[]> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<PayloadExperiment>>('experiments', {
      locale,
      limit: 500,
      sort: 'order',
      // depth 1 so relatedProject arrives as a document with a slug
      depth: 1,
    });

    return (res?.docs ?? []).map(normalizeExperiment);
  }

  return localExperiments;
}

export async function getExperimentBySlug(
  slug: string,
  locale: string,
): Promise<Experiment | undefined> {
  if (await usingPayload()) {
    const res = await cmsGet<PayloadListResponse<PayloadExperiment>>('experiments', {
      locale,
      limit: 1,
      depth: 1,
      where: { slug: { equals: slug } },
    });

    const doc = res?.docs?.[0];
    return doc ? normalizeExperiment(doc) : undefined;
  }

  // Slugs and identifiers diverged once the snapshot started carrying real
  // URL slugs (`ai-unreal` vs `ai-controlling-unreal`), so match the slug
  // first and fall back to the id for older entries that have none.
  return localExperiments.find((e) => (e.slug ?? e.id) === slug);
}
