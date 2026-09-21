import type { CurrentlyKind } from '~/data/currently';
import type { ExperimentState } from '~/data/experiments';
import type { DetailSectionId, ProjectStatus } from '~/data/projects';

/**
 * The shape every locale must satisfy. Because each dictionary is typed as
 * `Dictionary`, a forgotten key fails `astro check` instead of silently
 * rendering nothing in production.
 */
export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    work: string;
    lab: string;
    about: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    skipToContent: string;
    home: string;
  };
  hero: {
    statement: string;
    intro: string;
    scrollCue: string;
  };
  work: {
    label: string;
    title: string;
    lead: string;
    viewProject: string;
    noLinkYet: string;
    statusLabel: string;
    status: Record<ProjectStatus, string>;
  };
  /**
   * The four verbs under the hero. A restatement of the disciplines line as
   * things done rather than fields worked in.
   */
  credo: { word: string; hint: string }[];
  services: {
    label: string;
    title: string;
    lead: string;
    items: { title: string; body: string }[];
  };
  lab: {
    label: string;
    title: string;
    lead: string;
    /** Lab index page + detail pages. */
    indexTitle: string;
    indexLead: string;
    all: string;
    open: string;
    states: Record<ExperimentState, string>;
    headings: {
      tried: string;
      happened: string;
      next: string;
    };
    relatedProject: string;
    /** Index-only entries that have no written log yet. */
    noteOnly: string;
  };
  about: {
    label: string;
    title: string;
    /** The four areas, shown as a numbered strip above the prose. */
    arc: string[];
    paragraphs: string[];
    pull: string;
  };
  currently: {
    label: string;
    kinds: Record<CurrentlyKind, string>;
  };
  contact: {
    label: string;
    title: string;
    lead: string;
    emailCta: string;
    pending: string;
    elsewhere: string;
  };
  project: {
    backToWork: string;
    next: string;
    visit: string;
    disciplines: string;
    statusLabel: string;
    /** Shown when a case study exists only in English so far. */
    untranslated: string;
    headings: Record<DetailSectionId, string>;
    relatedExperiments: string;
    /** Caption strip above the evidence block. */
    evidence: string;
    /** Shown in place of media that has not been captured yet. */
    mediaPending: string;
    /** Click-to-load facade for an interactive scene from another site. */
    embed: {
      /** Button that loads the scene. */
      load: string;
      /** Says what loading costs and where it comes from. `{host}` is replaced. */
      note: string;
      /** Always-available link that opens the scene on its own site. */
      open: string;
    };
  };
  /** The 404 page. One page serves every locale; see src/pages/404.astro. */
  notFound: {
    title: string;
    lead: string;
    home: string;
    /** Label above the six language links. */
    languages: string;
  };
  footer: {
    colophon: string;
    backToTop: string;
    languageLabel: string;
    workingTranslation: string;
  };
}
