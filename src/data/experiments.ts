import type { LocalizedText } from '~/i18n/text';
import type { MediaItem } from '~/data/projects';
import { experimentsData } from './generated/experiments.data';

/**
 * LAB
 * ---
 * Smaller experiments, open questions and prototypes that are not case studies.
 * A lab entry is allowed to be an unanswered question — that is the point.
 */

export type ExperimentState = 'open-question' | 'in-progress' | 'ongoing';

export interface Experiment {
  id: string;
  /** Usually phrased as a question. */
  title: LocalizedText;
  state: ExperimentState;
  /** Short technical tag, not translated. */
  tag: string;
  /** URL segment for the lab detail page. Defaults to `id`. */
  slug?: string;
  /** The driving question, when it needs more room than the title. */
  question?: LocalizedText;
  shortNote?: LocalizedText;
  /**
   * The rough log. A lab note is allowed to end without an answer, so any of
   * these may be absent — an experiment with none of them stays a preview-only
   * entry on the index rather than becoming a thin page.
   */
  whatITried?: LocalizedText[];
  whatHappened?: LocalizedText[];
  nextQuestion?: LocalizedText[];
  /** Slug of the project this belongs to. Null when it genuinely stands alone. */
  relatedProjectSlug?: string | null;
  media?: MediaItem[];
}

/** Fallback content. Generated — see `src/data/generated/`. */
export const experiments: Experiment[] = experimentsData;
