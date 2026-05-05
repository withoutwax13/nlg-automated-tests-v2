import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e',
  timeout: 15000,
  expect: { timeout: 15000 },
  retries: 2,
  fullyParallel: false,
  use: {
    baseURL: 'https://dev.azavargovapps.com',
    viewport: { width: 1920, height: 1080 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
