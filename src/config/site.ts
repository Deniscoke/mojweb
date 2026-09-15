/**
 * CENTRAL BRAND / SITE CONFIG
 * ---------------------------
 * Everything here is working material and is meant to be replaced.
 * Change the brand in ONE place: this file.
 */

export const site = {
  /**
   * The site brand is the person. Project labs, projects and the lab are
   * activities of Denis Mitrović, not separate brands.
   */
  brand: 'Denis Mitrović',
  /** Mark used in the navigation and on the gate. */
  brandMark: 'Denis Mitrović',
  /** Secondary claim. */
  tagline: 'Ideas, made real.',
  /** Positioning sentence used across the site. */
  statement: 'I make ideas real.',

  author: {
    name: 'Denis Mitrović',
    /** Working role label. */
    role: 'Creative Technologist · Educator · Movement Coach',
    /**
     * Fields of work, rendered as a single typographic line. Deliberately
     * broader than software: the movement practices are part of the work, not
     * a hobby section bolted on the end.
     */
    disciplines: ['Technology', 'Learning', 'Movement', 'Creative Work'],
  },

  /*
   * The deployed origin is NOT set here. It comes from SITE_URL (or Vercel's
   * VERCEL_PROJECT_PRODUCTION_URL) via src/config/site-url.mjs and is read in
   * components as `Astro.site`. See .env.example.
   */

  /**
   * Contact + social. `null` means "not provided yet" and the entry is simply
   * not rendered. Never invent values here.
   */
  contact: {
    email: 'denis.mitrovi@gmail.com' as string | null,
    /** Human-readable form; the tel: link is derived by stripping spaces. */
    phone: '+420 728 523 267' as string | null,
    links: [
      { id: 'linkedin', label: 'LinkedIn', href: null as string | null }, // TODO
      { id: 'github', label: 'GitHub', href: null as string | null }, // TODO
      { id: 'instagram', label: 'Instagram', href: null as string | null }, // TODO
    ],
  },

  /**
   * Open Graph image, relative to /public. PNG because social platforms do
   * not render SVG. Source lives at src/assets/og.svg — edit that and run
   * `npm run og` to regenerate.
   */
  ogImage: '/assets/og-default.png',
} as const;

export type Site = typeof site;
