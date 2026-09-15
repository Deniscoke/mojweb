/**
 * SITEMAP + ROBOTS
 *
 * Written at the end of a build from the pages Astro actually generated, so a
 * route added or removed anywhere (including the CMS-driven ones) is reflected
 * without a second list to maintain. No dependency: the site is static and
 * the XML is trivial.
 *
 * Both files need an absolute origin. When the production URL is not known
 * (see src/config/site-url.mjs) the sitemap is skipped with a warning and
 * robots.txt is written without a Sitemap line — nothing is ever pointed at a
 * made-up domain.
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {{ source?: string, vercelEnv?: string }} [options]
 *   `source` says where the production URL came from (see site-url.mjs), so a
 *   production build that is still running on Vercel's stop-gap domain can say
 *   so loudly instead of silently baking it into every canonical.
 */
export default function sitemap({ source = 'none', vercelEnv } = {}) {
  /** @type {URL | undefined} */
  let site;

  return {
    name: 'sitemap',
    hooks: {
      'astro:config:done': ({ config, logger }) => {
        site = config.site ? new URL(config.site) : undefined;

        if (site && source === 'VERCEL_PROJECT_PRODUCTION_URL' && vercelEnv === 'production') {
          logger.warn(
            `SITE_URL is not set, so canonical/hreflang/sitemap use Vercel's production domain ${site.origin}. ` +
              'Once a custom domain is added, set SITE_URL to the PRIMARY (non-redirecting) domain in the Vercel project and redeploy.',
          );
        }
      },

      'astro:build:done': async ({ dir, pages, logger }) => {
        // Astro 5 passes a file URL; a plain path is accepted for safety.
        const outDir = dir instanceof URL ? dir : pathToFileURL(`${dir}/`);

        if (!site) {
          logger.warn(
            'No production URL (SITE_URL / VERCEL_PROJECT_PRODUCTION_URL): canonical, og:url, hreflang and sitemap.xml are omitted.',
          );
          await writeFile(new URL('robots.txt', outDir), 'User-agent: *\nAllow: /\n');
          return;
        }

        const urls = pages
          .map((page) => page.pathname)
          // Astro reports error pages too; they do not belong in a sitemap.
          .filter((pathname) => !/^(404|500)\/?$/.test(pathname))
          .map((pathname) => new URL(pathname.replace(/^\/+/, ''), site).href)
          .sort();

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`),
          '</urlset>',
          '',
        ].join('\n');

        const sitemapUrl = new URL('sitemap.xml', site).href;
        await writeFile(new URL('sitemap.xml', outDir), xml);
        await writeFile(new URL('robots.txt', outDir), `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
        logger.info(`sitemap.xml written with ${urls.length} URLs for ${site.origin} (${join('dist', 'sitemap.xml')})`);
      },
    },
  };
}
