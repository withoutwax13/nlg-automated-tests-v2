import { defineConfig, type ReporterDescription } from '@playwright/test';
import path from 'node:path';

const captureArtifacts = process.env.E2E_CAPTURE_ARTIFACTS === 'true';
const isGlobalStateRun = process.env.E2E_RUN_GLOBAL_STATE === 'true';
const isLocalParallelRun = process.env.BUSINESSES_LOCAL_PARALLEL === 'true';
const isLocalSingleRun = process.env.BUSINESSES_LOCAL_SINGLE === 'true';
const captureLocalFailureScreenshots =
  process.env.BUSINESSES_LOCAL_FAILURE_SCREENSHOTS === 'true';
const expectedSlotId = process.env.BUSINESSES_EXPECTED_SLOT_ID;
const testTimeoutMs = 15 * 60_000;
const expectTimeoutMs = 3 * 60_000;
const actionTimeoutMs = 3 * 60_000;
const navigationTimeoutMs = 3 * 60_000;
const localResultsRoot = path.resolve(
  __dirname,
  'test-results',
  'local',
);
const localParallelReportsRoot = path.join(
  localResultsRoot,
  'reports',
);

const globalStateTest = /[\\/]AGS[\\/]TC32\.spec\.ts$/;
const selectedSlotGrep =
  !isGlobalStateRun && expectedSlotId && /^slot-0[0-9]$/.test(expectedSlotId)
    ? new RegExp(`@${expectedSlotId}\\b`)
    : undefined;

function requiredAbsoluteOutputFile(
  environmentName: string,
  extension: string,
): string {
  const value = process.env[environmentName];
  if (
    !value ||
    !path.isAbsolute(value) ||
    path.extname(value).toLowerCase() !== extension
  ) {
    throw new Error(
      `${environmentName} must be an absolute ${extension} file for local parallel runs.`,
    );
  }
  return path.resolve(value);
}

function requiredAbsoluteOutputDirectory(environmentName: string): string {
  const value = process.env[environmentName];
  if (!value || !path.isAbsolute(value)) {
    throw new Error(
      `${environmentName} must be an absolute directory for local single-slot runs.`,
    );
  }
  return path.resolve(value);
}

function requirePathInside(
  parentDirectory: string,
  value: string,
  environmentName: string,
): void {
  const relativePath = path.relative(parentDirectory, value);
  if (
    relativePath.length === 0 ||
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(
      `${environmentName} must resolve beneath businesses/test-results/local/.`,
    );
  }
}

function requirePathInsideLocalReports(
  value: string,
  environmentName: string,
): void {
  const relativePath = path.relative(localParallelReportsRoot, value);
  if (
    relativePath.length === 0 ||
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(
      `${environmentName} must resolve beneath businesses/test-results/local/reports/.`,
    );
  }
}

let reporters: ReporterDescription[];
let localSingleOutputDirectory: string | undefined;
if (isLocalSingleRun && isLocalParallelRun) {
  throw new Error(
    'A Businesses run cannot be both local single-slot and local parallel.',
  );
}
if (isLocalParallelRun) {
  if (!expectedSlotId || !/^slot-0[0-9]$/.test(expectedSlotId)) {
    throw new Error(
      'BUSINESSES_EXPECTED_SLOT_ID must identify slot-00 through slot-09 for local parallel runs.',
    );
  }
  const resultFile = requiredAbsoluteOutputFile(
    'BUSINESSES_LOCAL_RESULT_FILE',
    '.json',
  );
  requirePathInsideLocalReports(resultFile, 'BUSINESSES_LOCAL_RESULT_FILE');
  const rawBlobOutputDirectory = process.env.PLAYWRIGHT_BLOB_OUTPUT_DIR;
  if (!rawBlobOutputDirectory || !path.isAbsolute(rawBlobOutputDirectory)) {
    throw new Error(
      'PLAYWRIGHT_BLOB_OUTPUT_DIR must be an absolute directory for local parallel runs.',
    );
  }
  const blobOutputDirectory = path.resolve(rawBlobOutputDirectory);
  requirePathInsideLocalReports(
    blobOutputDirectory,
    'PLAYWRIGHT_BLOB_OUTPUT_DIR',
  );
  if (process.env.PLAYWRIGHT_BLOB_OUTPUT_FILE) {
    throw new Error(
      'PLAYWRIGHT_BLOB_OUTPUT_FILE must be unset for local parallel runs.',
    );
  }
  if (process.env.PLAYWRIGHT_BLOB_OUTPUT_NAME !== 'report.zip') {
    throw new Error(
      'PLAYWRIGHT_BLOB_OUTPUT_NAME must be report.zip for local parallel runs.',
    );
  }

  reporters = [
    ['blob'],
    [
      require.resolve(
        './playwright/support/local-businesses-result-reporter',
      ),
      { slotId: expectedSlotId, outputFile: resultFile },
    ],
  ];
} else if (isLocalSingleRun) {
  if (!expectedSlotId || !/^slot-0[0-9]$/.test(expectedSlotId)) {
    throw new Error(
      'BUSINESSES_EXPECTED_SLOT_ID must identify slot-00 through slot-09 for local single-slot runs.',
    );
  }
  localSingleOutputDirectory = requiredAbsoluteOutputDirectory(
    'BUSINESSES_LOCAL_OUTPUT_DIR',
  );
  const htmlOutputDirectory = requiredAbsoluteOutputDirectory(
    'BUSINESSES_LOCAL_HTML_OUTPUT_DIR',
  );
  requirePathInside(
    localResultsRoot,
    localSingleOutputDirectory,
    'BUSINESSES_LOCAL_OUTPUT_DIR',
  );
  requirePathInside(
    localResultsRoot,
    htmlOutputDirectory,
    'BUSINESSES_LOCAL_HTML_OUTPUT_DIR',
  );
  if (
    path.dirname(localSingleOutputDirectory) !==
      path.dirname(htmlOutputDirectory) ||
    localSingleOutputDirectory === htmlOutputDirectory
  ) {
    throw new Error(
      'Local single-slot output and HTML directories must be distinct siblings.',
    );
  }
  reporters = [
    ['list'],
    ['html', { outputFolder: htmlOutputDirectory, open: 'never' }],
  ];
} else {
  reporters = [['list']];
}

// Publishing is opt-in so local discovery, preflight checks, and runs without
// the repository Actions secret never contact Testomatio. The reporter still
// receives Playwright test results and errors, so credential-bearing artifacts
// remain disabled by default below.
if (!isLocalParallelRun && !isLocalSingleRun && process.env.TESTOMATIO) {
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
  ...(localSingleOutputDirectory
    ? { outputDir: localSingleOutputDirectory }
    : {}),
  globalSetup: require.resolve('./playwright/support/global-setup'),
  // A missing locator previously consumed 20 minutes. Normal Businesses tests
  // finish well under two minutes, so fail fast while retaining backend slack.
  timeout: testTimeoutMs,
  expect: { timeout: expectTimeoutMs },
  // These tests mutate persistent business state. Automatic retries can make a
  // partial first attempt poison its retry, so retry orchestration stays explicit.
  retries: 0,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'https://dev.azavargovapps.com',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: actionTimeoutMs,
    navigationTimeout: navigationTimeoutMs,
    // Traces can retain login form fields and network data, so they remain off
    // even when opt-in screenshots/video are enabled.
    trace: 'off',
    video: captureArtifacts ? 'retain-on-failure' : 'off',
    screenshot:
      captureArtifacts || captureLocalFailureScreenshots
        ? 'only-on-failure'
        : 'off',
  },
});
