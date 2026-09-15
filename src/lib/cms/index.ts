/**
 * CMS data layer — barrel export.
 *
 * All CMS reads go through this module. Components never fetch from Payload
 * directly.
 *
 * A build resolves its content source once. Payload reachable → Payload is
 * canonical for routes and content alike; unreachable → the local TypeScript
 * files in `src/data/` serve both. Never one for routes and the other for
 * content.
 */

export { resolveContentSource, usingPayload } from './source';
export type { ContentSource } from './source';

export { getProjectRouteSlugs, getExperimentRouteSlugs } from './routes';

export { getProjects, getFeaturedProjects, getProjectBySlug, getNeighbourProject } from './projects';
export { getExperiments, getExperimentBySlug } from './experiments';
export { getExperimentsForProject, hasLabDetail } from './relationships';
export { getCurrently } from './currently';
export type { CurrentlyView } from './currently';
export { getSiteSettings } from './siteSettings';
export type { SiteSettingsView } from './siteSettings';

// Pure utility re-exported so pages import everything from one place
export { maturityOf } from '~/data/projects';
