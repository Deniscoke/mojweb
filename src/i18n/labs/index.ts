import type { LabSlug } from '~/data/labs';
import { DEFAULT_LOCALE, type LocaleCode } from '../locales';
import cs from './cs.json';
import en from './en.json';
import es from './es.json';
import sk from './sk.json';
import sr from './sr.json';
import tr from './tr.json';

/**
 * PROJECT LABS COPY — one JSON file per locale.
 *
 * JSON rather than TypeScript so translations can be produced and reviewed as
 * data. The `satisfies` check below is what keeps them honest: a locale with a
 * missing or misspelled key fails `astro check`, exactly like the dictionaries.
 * Czech is the source; the printed PDFs exist only in Czech, which every other
 * locale says in its PDF labels.
 */

export interface LabCopy {
  question: string;
  short: string;
  lead: string;
  studentsDo: string[];
  output: string;
  subjects: string[];
  tech: string;
  note?: { title: string; body: string };
}

export interface LabsCopy {
  navLabel: string;
  entry: { label: string; title: string; lead: string; cta: string };
  meta: { title: string; description: string; ogAlt: string; detailSuffix: string };
  nav: { labs: string; formats: string; projects: string; contact: string; about: string; allLabs: string };
  hero: {
    label: string;
    line1: string;
    line2: string;
    lead: string;
    credo: string;
    ctaExplore: string;
    ctaContact: string;
  };
  readout: {
    forKey: string;
    forValue: string;
    groupKey: string;
    groupValue: string;
    formatsKey: string;
    formatsValue: string;
    yearKey: string;
  };
  manifest: { label: string; title: string; p1: string; p2: string; signature: string };
  list: { label: string; title: string; lead: string; more: string };
  formats: {
    label: string;
    title: string;
    lead: string;
    items: { duration: string; name: string; body: string }[];
    anywhere: string;
    onlineName: string;
    onlineBody: string;
  };
  group: { label: string; max: string; title: string; short: string; ideal: string; why: string; flex: string };
  principles: { label: string; items: string[] };
  projects: { label: string; title: string; lead: string; usageMeta: string; invokMeta: string };
  contact: {
    label: string;
    title: string;
    emailCta: string;
    mailSubject: string;
    pdfPoster: string;
    pdfCards: string;
    heroPdf: string;
    signature: string;
  };
  detail: {
    crumbs: string;
    doing: string;
    output: string;
    subjects: string;
    formats: string;
    fitYes: string;
    fitNo: string;
    onlineYes: string;
    onlineNo: string;
    tech: string;
    group: string;
    groupStrong: string;
    related: string;
    kindProject: string;
    kindLab: string;
    /** Contains the `{lab}` placeholder. */
    contactTitle: string;
    pdfCards: string;
    pdfPoster: string;
    pagerLabel: string;
    prev: string;
    next: string;
  };
  labs: Record<LabSlug, LabCopy>;
}

export const labsCopy = { en, cs, sk, es, sr, tr } satisfies Record<LocaleCode, LabsCopy>;

export function getLabsCopy(lang: string): LabsCopy {
  return (labsCopy as Record<string, LabsCopy>)[lang] ?? labsCopy[DEFAULT_LOCALE];
}
