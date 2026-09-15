import type { LocalizedText } from '~/i18n/text';
import { currentlyData, currentlyUpdatedData } from './generated/currently.data';

/**
 * CURRENTLY
 * ---------
 * The most frequently edited file on the site. Change a line here and the
 * homepage is up to date. Labels ("Currently building") come from the
 * dictionaries; the values live here because they are usually proper nouns.
 */

export type CurrentlyKind = 'building' | 'exploring' | 'experimenting' | 'thinking';

export interface CurrentlyItem {
  id: string;
  kind: CurrentlyKind;
  value: LocalizedText;
  href?: string | null;
}

/** Shown next to the module so the reader knows how fresh this is. */
/** Fallback content. Generated — see `src/data/generated/`. */
export const currentlyUpdated: string = currentlyUpdatedData;
export const currently: CurrentlyItem[] = currentlyData;
