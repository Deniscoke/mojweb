/**
 * LOCALE REGISTRY
 * ---------------
 * Adding a language = add an entry here + a dictionary in ./translations
 * + a data translation pass. Routes are generated from `route`.
 *
 * Serbian is Latin script only (`sr-Latn` for metadata, `/sr` as public route).
 */

export interface LocaleDef {
  /** Internal key, also the dictionary key. */
  code: string;
  /** Public URL segment: /en, /cs, ... */
  route: string;
  /** BCP 47 tag for <html lang> and hreflang. */
  htmlLang: string;
  /** Two-letter label shown in the language gate. */
  label: string;
  /** Endonym, shown as the secondary label. */
  name: string;
  /** Greeting used by the entry morph animation. */
  greeting: string;
  /**
   * Translation maturity. `working` locales render a small, honest notice
   * instead of pretending the copy is final.
   */
  quality: 'reviewed' | 'working';
}

export const LOCALES = [
  { code: 'en', route: 'en', htmlLang: 'en', label: 'EN', name: 'English', greeting: 'HELLO', quality: 'reviewed' },
  { code: 'cs', route: 'cs', htmlLang: 'cs', label: 'CZ', name: 'Čeština', greeting: 'AHOJ', quality: 'reviewed' },
  { code: 'sk', route: 'sk', htmlLang: 'sk', label: 'SK', name: 'Slovenčina', greeting: 'AHOJ', quality: 'reviewed' },
  { code: 'es', route: 'es', htmlLang: 'es', label: 'ES', name: 'Español', greeting: 'HOLA', quality: 'working' },
  { code: 'sr', route: 'sr', htmlLang: 'sr-Latn', label: 'SR', name: 'Srpski', greeting: 'ZDRAVO', quality: 'working' },
  { code: 'tr', route: 'tr', htmlLang: 'tr', label: 'TR', name: 'Türkçe', greeting: 'MERHABA', quality: 'working' },
] as const satisfies readonly LocaleDef[];

export type LocaleCode = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

/** Unique greetings, in the order the entry animation morphs through them. */
export const GREETING_SEQUENCE: string[] = [...new Set(LOCALES.map((l) => l.greeting))];

export function getLocale(code: string): LocaleDef {
  const found = LOCALES.find((l) => l.code === code);
  if (!found) throw new Error(`Unknown locale: ${code}`);
  return found;
}

export function isLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}

/** Absolute-from-root path for a locale, always with a trailing slash. */
export function localePath(code: string, sub = ''): string {
  const clean = sub.replace(/^\/+|\/+$/g, '');
  return clean ? `/${code}/${clean}/` : `/${code}/`;
}
