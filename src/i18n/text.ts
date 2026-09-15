import { DEFAULT_LOCALE, type LocaleCode } from './locales';

/**
 * A string that may be translated per locale.
 *
 * Content entities (projects, lab experiments, "currently") keep their copy
 * inline so that adding a project means editing exactly one file. English is
 * required; any missing locale falls back to English rather than to an empty
 * string, so a half-translated site is still a readable site.
 */
export type LocalizedText = string | ({ en: string } & Partial<Record<LocaleCode, string>>);

export function t(value: LocalizedText, lang: string): string {
  if (typeof value === 'string') return value;
  return value[lang as LocaleCode] ?? value[DEFAULT_LOCALE] ?? value.en;
}
