/**
 * CENTRAL BRAND / SITE CONFIG
 * ---------------------------
 * Everything here is working material and is meant to be replaced.
 * Change the brand in ONE place: this file.
 */

export const site = {
  /** Working brand name. Not final. */
  brand: 'IRL',
  /** Short mark used in the navigation when space is tight. */
  brandMark: 'IRL',
  /** Working tagline. Not final. */
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

  /** Deployed origin. Used for canonical + hreflang + og:url. */
  url: 'https://irl.example.com', // TODO: replace with the real domain

  /**
   * Contact + social. `null` means "not provided yet" and the entry is simply
   * not rendered. Never invent values here.
   */
  contact: {
    email: null as string | null, // TODO
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
