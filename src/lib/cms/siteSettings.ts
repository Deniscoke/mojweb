/**
 * Site settings data layer — CMS with local fallback.
 */

import { cmsGetGlobal } from './client';
import { usingPayload } from './source';
import type { PayloadSiteSettings } from './types';
import { site } from '~/config/site';

export interface SiteSettingsView {
  brandName: string
  tagline: string
  email: string | null
  linkedin: string | null
  github: string | null
  instagram: string | null
  productionSiteUrl: string | null
}

/**
 * Contact fields stay null when Payload leaves them empty. An unset LinkedIn
 * is a fact about the site, not a gap to be filled from somewhere else.
 */
export async function getSiteSettings(): Promise<SiteSettingsView> {
  if (await usingPayload()) {
    const response = await cmsGetGlobal<PayloadSiteSettings>('site-settings');

    if (response) {
      return {
        brandName: response.brandName || site.brand,
        tagline: response.tagline || site.tagline,
        email: response.email || null,
        linkedin: response.linkedin || null,
        github: response.github || null,
        instagram: response.instagram || null,
        productionSiteUrl: response.productionSiteUrl || null,
      };
    }
  }

  // Fallback to local config
  return {
    brandName: site.brand,
    tagline: site.tagline,
    email: site.contact.email,
    linkedin: site.contact.links.find((l) => l.id === 'linkedin')?.href ?? null,
    github: site.contact.links.find((l) => l.id === 'github')?.href ?? null,
    instagram: site.contact.links.find((l) => l.id === 'instagram')?.href ?? null,
    productionSiteUrl: null,
  };
}
