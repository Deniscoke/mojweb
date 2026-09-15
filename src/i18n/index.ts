import type { Dictionary } from './dictionary';
import { DEFAULT_LOCALE, type LocaleCode } from './locales';
import { cs } from './translations/cs';
import { en } from './translations/en';
import { es } from './translations/es';
import { sk } from './translations/sk';
import { sr } from './translations/sr';
import { tr } from './translations/tr';

export const dictionaries = { en, cs, sk, es, sr, tr } satisfies Record<LocaleCode, Dictionary>;

/**
 * Every dictionary is typed as `Dictionary`, so a missing key is a build
 * failure rather than an empty string in production. This lookup only has to
 * defend against an unknown *route*.
 */
export function useTranslations(lang: string): Dictionary {
  return dictionaries[lang as LocaleCode] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Dictionary };
export { t, type LocalizedText } from './text';
export * from './locales';
