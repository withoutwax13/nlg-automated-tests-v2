import { defineConfig, type ReporterDescription } from '@playwright/test';

const captureArtifacts = process.env.E2E_CAPTURE_ARTIFACTS === 'true';
const isGlobalStateRun = process.env.E2E_RUN_GLOBAL_STATE === 'true';
const expectedSlotId = process.env.BUSINESSES_EXPECTED_SLOT_ID;

const globalStateTest = /[\\/]AGS[\\/]TC32\.spec\.ts$/;
const selectedSlotGrep =
  !isGlobalStateRun && expectedSlotId && /^slot-0[0-9]$/.test(expectedSlotId)
    ? new RegExp(`@${expectedSlotId}\\b`)
    : undefined;

const reporters: ReporterDescription[] = [['list']];

// Publishing is opt-in so local discovery, preflight checks, and runs without
// the repository Actions secret never contact Testomatio. The reporter still
// receives Playwright test results and errors, so credential-bearing artifacts
// remain disabled by default below.
if (process.env.TESTOMATIO) {
  reporters.push([
    '@testomatio/reporter/playwright',
    { apiKey: process.env.TESTOMATIO },
  ]);
}

export default defineConfig({
  reporter: reporters,
  testDir: './playwright/e2e',
  ...(isGlobalStateRun ? { testMatch: globalStateTest } : {}),
  ...(selectedSlotGrep ? { grep: selectedSlotGrep } : {}),
  globalSetup: require.resolve('./playwright/support/global-setup'),
  timeout: 360000,
  expect: { timeout: 360000 },
  // These tests mutate persistent business state. Automatic retries can make a
  // partial first attempt poison its retry, so retry orchestration stays explicit.
  retries: 0,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'https://dev.azavargovapps.com',
    viewport: { width: 1920, height: 1080 },
    // Traces can retain login form fields and network data, so they remain off
    // even when opt-in screenshots/video are enabled.
    trace: 'off',
    video: captureArtifacts ? 'retain-on-failure' : 'off',
    screenshot: captureArtifacts ? 'only-on-failure' : 'off',
  },
});
