import { defineConfig } from '@playwright/test';
import type { MsTeamsReporterOptions } from "playwright-msteams-reporter";

export default defineConfig({
  reporter: [
    ['list'],
    [
      'playwright-msteams-reporter',
      <MsTeamsReporterOptions>{
        webhookUrl: "https://prod-152.westus.logic.azure.com:443/workflows/5ecb6cccf42f48e6a240a92275af617d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ib4Goq1lL_YAalMJ0H3US8NzyUlwrDIPAFtAYUHD-mk",
        webhookType: "powerautomate", // or "msteams",
        title: "Reports Service - Regression Test Result",
        enableDuration: true
      }
    ]
  ],
  testDir: './playwright/e2e',
  timeout: 120000,
  expect: { timeout: 120000 },
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
