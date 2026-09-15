/**
 * PROJECT ↔ EXPERIMENT RELATIONSHIPS.
 *
 * `Experiment.relatedProject` is the single source of truth. A project's
 * related experiments are derived from it rather than stored a second time,
 * so the two halves cannot drift out of agreement.
 */

import { getExperiments } from './experiments';
import type { Experiment } from '~/data/experiments';

/** Experiments pointing at this project, in display order. */
export async function getExperimentsForProject(
  projectSlug: string,
  locale: string,
): Promise<Experiment[]> {
  const all = await getExperiments(locale);
  return all.filter((e) => e.relatedProjectSlug === projectSlug);
}

/**
 * True when an experiment has enough written material to justify its own page.
 * Without this, an entry that is only a title would generate a thin page in
 * six locales; those stay preview-only on the Lab index instead.
 */
export function hasLabDetail(e: Experiment): boolean {
  return Boolean(
    (e.whatITried && e.whatITried.length) ||
      (e.whatHappened && e.whatHappened.length) ||
      (e.nextQuestion && e.nextQuestion.length),
  );
}
