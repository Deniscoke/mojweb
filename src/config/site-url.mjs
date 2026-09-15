// @ts-check
/**
 * PRODUCTION SITE URL — the single source of truth
 * ================================================
 * Plain JS on purpose: astro.config.mjs runs before TypeScript path aliases
 * exist, so this is the one module both the config and the site can import.
 *
 * Resolution order:
 *   1. SITE_URL                        explicit primary domain, e.g.
 *                                      https://www.example.cz — REQUIRED for
 *                                      production once a custom domain exists
 *   2. VERCEL_PROJECT_PRODUCTION_URL   Vercel system variable (domain only),
 *                                      set on production AND preview builds.
 *                                      A stop-gap: Vercel reports the
 *                                      *shortest* production domain, which
 *                                      can be an apex that redirects to www.
 *   3. nothing                         canonical, og:url, hreflang and the
 *                                      sitemap are omitted, never invented
 *
 * The value is read once by astro.config.mjs and becomes Astro's `site`.
 * Components read it back through `Astro.site`, so no other file needs to
 * know where it came from.
 */

/**
 * @typedef {{ url: string | undefined, source: 'SITE_URL' | 'VERCEL_PROJECT_PRODUCTION_URL' | 'none' }} ResolvedSiteUrl
 */

/**
 * @param {Record<string, string | undefined>} env
 * @returns {ResolvedSiteUrl} `url` is an origin with protocol and no trailing slash.
 */
export function resolveSiteUrl(env) {
  const explicit = (env.SITE_URL ?? '').trim();
  const vercel = (env.VERCEL_PROJECT_PRODUCTION_URL ?? '').trim();

  /** @type {ResolvedSiteUrl['source']} */
  const source = explicit ? 'SITE_URL' : vercel ? 'VERCEL_PROJECT_PRODUCTION_URL' : 'none';
  const raw = explicit || (vercel ? `https://${vercel}` : '');
  if (!raw) return { url: undefined, source };

  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`unsupported protocol ${url.protocol}`);
    return { url: url.origin, source };
  } catch (error) {
    // A malformed value must fail loudly: a silently wrong canonical is worse
    // than no canonical at all.
    throw new Error(`${source} is not a valid absolute URL: "${raw}" (${/** @type {Error} */ (error).message})`);
  }
}
