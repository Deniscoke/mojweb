// @ts-check
import { defineConfig } from 'astro/config';
import mediaSnapshot from './integrations/media-snapshot.mjs';

// Single source of truth for the deployed origin lives in src/config/site.ts.
// It is duplicated here because astro.config runs outside the TS path aliases.
export default defineConfig({
  site: 'https://irl.example.com',
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
  // Copies published Payload uploads into dist/media/ so the built site
  // carries its own images and needs nothing from the CMS at runtime.
  integrations: [mediaSnapshot()],
  devToolbar: { enabled: false },
});
