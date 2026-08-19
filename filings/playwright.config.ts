import { defineConfig } from '@playwright/test';

const captureArtifacts = process.env.E2E_CAPTURE_ARTIFACTS === 'true';
const isGlobalStateRun = process.env.E2E_RUN_GLOBAL_STATE === 'true';

const globalStateTest = /[\\/]Approvals[\\/]TC40\.spec\.ts$/;

export default defineConfig({
  testDir: './playwright/e2e',
  ...(isGlobalStateRun ? { testMatch: globalStateTest } : {}),
  globalSetup: require.resolve('./playwright/support/global-setup'),
  timeout: 960000,
  expect: { timeout: 960000 },
  retries: 2,
  // Parallelism is provided by ten explicitly tagged GitHub matrix jobs. A
  // selected secret belongs to exactly one worker.
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'https://dev.azavargovapps.com',
    viewport: { width: 1920, height: 1080 },
    // Traces can retain form inputs and network data. Keep them off for credentialed runs.
    trace: 'off',
    screenshot: captureArtifacts ? 'only-on-failure' : 'off',
    video: captureArtifacts ? 'retain-on-failure' : 'off',
  },
});
