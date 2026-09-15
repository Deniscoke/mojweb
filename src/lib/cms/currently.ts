/**
 * Currently data layer. Same source policy as projects.
 */

import { cmsGetGlobal } from './client';
import { normalizeCurrently } from './normalize';
import { usingPayload } from './source';
import type { PayloadCurrently } from './types';
import type { CurrentlyItem } from '~/data/currently';

import { currently as localCurrently, currentlyUpdated as localUpdated } from '~/data/currently';

export interface CurrentlyView {
  items: CurrentlyItem[];
  updatedLabel: string;
}

export async function getCurrently(locale: string): Promise<CurrentlyView> {
  if (await usingPayload()) {
    const res = await cmsGetGlobal<PayloadCurrently>('currently', locale);
    if (res) return normalizeCurrently(res);
  }

  return { items: localCurrently, updatedLabel: localUpdated };
}
