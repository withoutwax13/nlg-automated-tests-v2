import { defineConfig } from '@playwright/test';

const captureArtifacts = process.env.E2E_CAPTURE_ARTIFACTS === 'true';
const isGlobalStateRun = process.env.E2E_RUN_GLOBAL_STATE === 'true';

const globalStateTest = /[\\/]AGS[\\/]TC32\.spec\.ts$/;

export default defineConfig({
  // External reporters can transmit error details containing test data.
  // Keep credentialed runs on the local console reporter.
  reporter: [['list']],
  testDir: './playwright/e2e',
  ...(isGlobalStateRun ? { testMatch: globalStateTest } : {}),
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
