// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mediaSnapshot from './integrations/media-snapshot.mjs';
import sitemap from './integrations/sitemap.mjs';
import { resolveSiteUrl } from './src/config/site-url.mjs';

// The production origin comes from ONE place: src/config/site-url.mjs, fed by
// SITE_URL (or Vercel's VERCEL_PROJECT_PRODUCTION_URL). Shell variables win
// over .env files, which is how Vercel injects them.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const env = { ...fileEnv, ...process.env };
const { url: siteUrl, source: siteUrlSource } = resolveSiteUrl(env);

export default defineConfig({
  site: siteUrl,
  trailingSlash: 'always',
  prefetch: {
    // Locale pages are tiny static documents. Prefetching them on hover/focus
    // is what makes the language transition feel like one continuous motion
    // instead of "click -> blank -> new page".
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  // media-snapshot copies published Payload uploads into dist/media/ so the
  // built site carries its own images and needs nothing from the CMS at
  // runtime. sitemap writes sitemap.xml + robots.txt from the built pages.
  integrations: [
    mediaSnapshot(),
    sitemap({ source: siteUrlSource, vercelEnv: env.VERCEL_ENV }),
  ],
  devToolbar: { enabled: false },
});
