import { defineConfig, type Project } from '@playwright/test';

/**
 * End-to-end checks for the motion-depth work (docs/motion-depth-plan.md §11).
 *
 *   npm run build
 *   npm run test:e2e                      desktop + mobile, against `astro preview`
 *   E2E_STRICT=1 npm run test:e2e         after integration: pending features fail
 *   npm run test:e2e:gpu                  headed Chrome on the real GPU: depth
 *                                         scripts under 6× CPU throttle, contrast
 *                                         over the scan (opens a window)
 *
 * The browser is the system Chrome (`channel: 'chrome'`): nothing is
 * downloaded, and it is the engine the depth work is designed against.
 * The suite reads the built site, so it always runs after `npm run build`.
 * docs/motion-depth-qa.md explains every test and what it guards.
 */

const PORT = Number(process.env.E2E_PORT ?? 4618);
const baseURL = `http://127.0.0.1:${PORT}`;

const projects: Project[] = [
  {
    name: 'desktop',
    grepInvert: /@gpu|@mobile-only/,
    use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  },
  {
    // A phone, as the plan means it: touch, no hover, below 48rem.
    name: 'mobile',
    grepInvert: /@gpu|@desktop-only/,
    use: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  },
];

// Asked for by name on the command line, or by env. The env is what the
// worker processes inherit, so the project exists for them too.
if (process.argv.some((a) => a === '--project=gpu')) process.env.E2E_GPU = '1';
if (process.env.E2E_GPU === '1') {
  // Headed, real GPU (§11 "Long tasks", "Contrast"). Lighthouse and plain
  // headless Chrome rasterise in software, where `failIfMajorPerformanceCaveat`
  // means the scan never renders, so these only mean something here.
  projects.push({
    name: 'gpu',
    grep: /@gpu/,
    use: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      headless: false,
      launchOptions: { args: ['--use-gl=angle', '--ignore-gpu-blocklist'] },
    },
  });
}

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'artifacts/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
    // "Pixel-identical to today" (W3, W4) means exactly that.
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'allow', caret: 'hide', scale: 'css' },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'artifacts/e2e-report' }]] : 'list',
  use: {
    baseURL,
    channel: 'chrome',
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    trace: 'retain-on-failure',
  },
  projects,
  webServer: {
    command: `npx astro preview --port ${PORT} --host 127.0.0.1`,
    url: `${baseURL}/en/`,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
  },
});
