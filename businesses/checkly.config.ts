import { defineConfig } from 'checkly'
import { Frequency } from "checkly/constructs";

const config = defineConfig({
  logicalId: 'businesses',
  projectName: 'businesses',
  checks: {
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        logicalId: 'playwright-check',
        name: 'Playwright Test',
        testCommand: 'npx playwright test',
        locations: [
          'eu-central-1',
        ],
        frequency: Frequency.EVERY_24H,
      },
    ],
    frequency: Frequency.EVERY_24H,
    locations: [
      'us-east-1',
    ],
  },
  cli: {
    runLocation: 'us-east-1',
  },
})

export default config