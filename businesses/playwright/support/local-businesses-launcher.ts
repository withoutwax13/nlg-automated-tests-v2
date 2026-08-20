import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import * as nodeUtil from 'node:util';

import {
  EXPECTED_SLOT_ID_ENV,
  parseResourceSlot,
  RESOURCE_SLOT_ENV,
} from './resource-pool';

const LOCAL_SLOT_ENV_PREFIX = 'BUSINESSES_SLOT_';
const GLOBAL_STATE_ENV = 'E2E_RUN_GLOBAL_STATE';
const CAPTURE_ARTIFACTS_ENV = 'E2E_CAPTURE_ARTIFACTS';
const SLOT_ID_PATTERN = /^slot-(0[0-9])$/;
const TESTOMATIO_ENV_PREFIX = 'TESTOMATIO';
const PLAYWRIGHT_DEBUG_ENV = 'PWDEBUG';
const DEBUG_ENV = 'DEBUG';
const LOCAL_FAILURE_SCREENSHOTS_ENV =
  'BUSINESSES_LOCAL_FAILURE_SCREENSHOTS';
const LOCAL_SINGLE_RUN_ENV = 'BUSINESSES_LOCAL_SINGLE';
const LOCAL_SINGLE_HTML_ENV = 'BUSINESSES_LOCAL_HTML_OUTPUT_DIR';
const LOCAL_SINGLE_OUTPUT_ENV = 'BUSINESSES_LOCAL_OUTPUT_DIR';

const businessesDirectory = path.resolve(__dirname, '..', '..');
export const LOCAL_BUSINESSES_RESULTS_ROOT = path.join(
  businessesDirectory,
  'test-results',
  'local',
);
export const LOCAL_BUSINESSES_RESULTS_LOCK = path.join(
  businessesDirectory,
  '.local-businesses-results.lock',
);
export const LOCAL_BUSINESSES_ENV_FILE = path.join(
  businessesDirectory,
  '.env.businesses.local',
);

const LOCAL_SLOT_ENV_NAMES = Array.from(
  { length: 10 },
  (_, index) => `${LOCAL_SLOT_ENV_PREFIX}${String(index).padStart(2, '0')}`,
);
const LOCAL_SLOT_ENV_NAME_SET = new Set(LOCAL_SLOT_ENV_NAMES);

type ParseEnv = (contents: string) => Record<string, string>;
type LocalEnvFileReader = (filePath: string, encoding: 'utf8') => string;

export interface LocalSingleRunPaths {
  runId: string;
  rootDirectory: string;
  outputDirectory: string;
  htmlDirectory: string;
}

export interface LocalResultsLease {
  release: () => void;
}

// @types/node is currently pinned to Node 18 through the dependency tree, but
// the project runtime is Node 24. Keep the compatibility cast local.
const parseEnv = (nodeUtil as unknown as { parseEnv?: ParseEnv }).parseEnv;

function isStrictDescendant(parentDirectory: string, candidate: string): boolean {
  const relativePath = path.relative(
    path.resolve(parentDirectory),
    path.resolve(candidate),
  );
  return (
    relativePath.length > 0 &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath)
  );
}

function createPrivateDirectory(directory: string): void {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  try {
    chmodSync(directory, 0o700);
  } catch {
    // Windows uses the workspace's NTFS ACL instead of POSIX modes.
  }
}

function assertOrdinaryDirectory(directory: string, label: string): void {
  const metadata = lstatSync(directory);
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
    throw new Error(`${label} must be an ordinary directory, not a link or file.`);
  }
}

export function resetLocalBusinessesResults(
  resultsRoot: string = LOCAL_BUSINESSES_RESULTS_ROOT,
  expectedBusinessesDirectory: string = businessesDirectory,
): void {
  const expectedRoot = path.resolve(
    expectedBusinessesDirectory,
    'test-results',
    'local',
  );
  const resolvedRoot = path.resolve(resultsRoot);
  if (resolvedRoot !== expectedRoot) {
    throw new Error(
      'Refusing to reset anything except the managed Businesses local results directory.',
    );
  }

  const resolvedBusinessesDirectory = path.resolve(expectedBusinessesDirectory);
  assertOrdinaryDirectory(
    resolvedBusinessesDirectory,
    'The Businesses project directory',
  );
  const realBusinessesDirectory = realpathSync(resolvedBusinessesDirectory);
  const testResultsDirectory = path.join(
    resolvedBusinessesDirectory,
    'test-results',
  );

  if (existsSync(testResultsDirectory)) {
    assertOrdinaryDirectory(
      testResultsDirectory,
      'businesses/test-results',
    );
    if (
      realpathSync(testResultsDirectory) !==
      path.join(realBusinessesDirectory, 'test-results')
    ) {
      throw new Error(
        'Refusing to reset businesses/test-results through an unexpected filesystem path.',
      );
    }
  } else {
    mkdirSync(testResultsDirectory, { mode: 0o700 });
  }

  if (existsSync(resolvedRoot)) {
    assertOrdinaryDirectory(
      resolvedRoot,
      'businesses/test-results/local',
    );
    rmSync(resolvedRoot, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  }
  createPrivateDirectory(resolvedRoot);
}

export function acquireLocalResultsLease(
  lockDirectory: string = LOCAL_BUSINESSES_RESULTS_LOCK,
): LocalResultsLease {
  const resolvedLockDirectory = path.resolve(lockDirectory);
  const expectedLockDirectory = path.join(
    path.dirname(resolvedLockDirectory),
    '.local-businesses-results.lock',
  );
  if (resolvedLockDirectory !== expectedLockDirectory) {
    throw new Error('The local Businesses results lock path is invalid.');
  }

  try {
    mkdirSync(resolvedLockDirectory, { mode: 0o700 });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'EEXIST'
    ) {
      throw new Error(
        'Another local Businesses run owns test-results. Wait for it to finish. ' +
          'If no run is active, remove businesses/.local-businesses-results.lock and retry.',
      );
    }
    throw new Error('Unable to acquire the local Businesses results lock.');
  }

  const token = randomUUID();
  const ownerFile = path.join(resolvedLockDirectory, 'owner.json');
  try {
    writeFileSync(
      ownerFile,
      JSON.stringify({ pid: process.pid, token }),
      { encoding: 'utf8', flag: 'wx', mode: 0o600 },
    );
  } catch {
    try {
      rmdirSync(resolvedLockDirectory);
    } catch {
      // Preserve an unexpected lock payload rather than deleting it recursively.
    }
    throw new Error('Unable to initialize the local Businesses results lock.');
  }

  let released = false;
  return {
    release: () => {
      if (released) {
        return;
      }
      released = true;
      let owner: unknown;
      try {
        owner = JSON.parse(readFileSync(ownerFile, 'utf8'));
      } catch {
        return;
      }
      if (
        typeof owner !== 'object' ||
        owner === null ||
        (owner as { token?: unknown }).token !== token
      ) {
        return;
      }
      try {
        unlinkSync(ownerFile);
        rmdirSync(resolvedLockDirectory);
      } catch {
        // A later run will fail closed instead of deleting an unknown lock.
      }
    },
  };
}

export function createLocalSingleRunPaths(
  slotId: string,
  now: Date = new Date(),
  processId: number = process.pid,
): LocalSingleRunPaths {
  if (
    !SLOT_ID_PATTERN.test(slotId) ||
    Number.isNaN(now.getTime()) ||
    !Number.isInteger(processId) ||
    processId < 1
  ) {
    throw new Error('Unable to create valid local Businesses single-run paths.');
  }
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const runId = `${timestamp}-${processId}-${slotId}`;
  const rootDirectory = path.join(
    LOCAL_BUSINESSES_RESULTS_ROOT,
    'single',
    runId,
  );
  return {
    runId,
    rootDirectory,
    outputDirectory: path.join(rootDirectory, 'output'),
    htmlDirectory: path.join(rootDirectory, 'html'),
  };
}

export interface LocalLauncherArguments {
  slotId: string;
  playwrightArgs: string[];
}

function isManagedPlaywrightArgument(argument: string): boolean {
  return (
    argument === '--workers' ||
    argument.startsWith('--workers=') ||
    argument === '--shard' ||
    argument.startsWith('--shard=') ||
    argument === '--config' ||
    argument.startsWith('--config=') ||
    argument.startsWith('-j') ||
    argument.startsWith('-c') ||
    argument.startsWith('--ui') ||
    argument.startsWith('--debug') ||
    argument.startsWith('--pass-with-no-tests') ||
    argument.startsWith('--retries') ||
    argument.startsWith('--repeat-each') ||
    argument.startsWith('--reporter') ||
    argument.startsWith('--trace') ||
    argument === '--output' ||
    argument.startsWith('--output=')
  );
}

export function parseLocalLauncherArguments(
  argumentsToParse: readonly string[],
): LocalLauncherArguments {
  let slotId: string | undefined;
  const playwrightArgs: string[] = [];

  for (const argument of argumentsToParse) {
    if (argument === '--slot') {
      throw new Error(
        'The local Businesses launcher requires --slot=slot-NN (with an equals sign).',
      );
    }

    if (argument.startsWith('--slot=')) {
      if (slotId !== undefined) {
        throw new Error('The local Businesses launcher accepts exactly one --slot argument.');
      }

      const requestedSlotId = argument.slice('--slot='.length);
      if (!SLOT_ID_PATTERN.test(requestedSlotId)) {
        throw new Error('--slot must be one of slot-00 through slot-09.');
      }

      slotId = requestedSlotId;
      continue;
    }

    if (isManagedPlaywrightArgument(argument)) {
      throw new Error(
        'That Playwright argument is blocked by the local Businesses launcher safety policy.',
      );
    }

    playwrightArgs.push(argument);
  }

  if (slotId === undefined) {
    throw new Error(
      'The local Businesses launcher requires --slot=slot-NN (slot-00 through slot-09).',
    );
  }

  return { slotId, playwrightArgs };
}

export function getLocalSlotEnvironmentName(slotId: string): string {
  const match = SLOT_ID_PATTERN.exec(slotId);
  if (match === null) {
    throw new Error('--slot must be one of slot-00 through slot-09.');
  }

  return `${LOCAL_SLOT_ENV_PREFIX}${match[1]}`;
}

export function parseLocalBusinessesEnvFile(
  fileContents: string,
): Readonly<Record<string, string>> {
  if (typeof parseEnv !== 'function') {
    throw new Error(
      'The local Businesses launcher requires Node.js 24 or newer.',
    );
  }

  const normalizedContents = fileContents.replace(/^\uFEFF/, '');
  const seenEnvironmentNames = new Set<string>();

  for (const [index, line] of normalizedContents.split(/\r?\n/).entries()) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      continue;
    }

    const assignment = /^([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(trimmedLine);
    if (assignment === null) {
      throw new Error(
        `Invalid .env.businesses.local syntax on line ${index + 1}; each value must use one KEY=value line.`,
      );
    }

    const environmentName = assignment[1];
    if (!LOCAL_SLOT_ENV_NAME_SET.has(environmentName)) {
      throw new Error(
        `Invalid .env.businesses.local key on line ${index + 1}; only BUSINESSES_SLOT_00 through BUSINESSES_SLOT_09 are allowed.`,
      );
    }

    if (seenEnvironmentNames.has(environmentName)) {
      throw new Error(
        `Invalid .env.businesses.local: ${environmentName} is assigned more than once.`,
      );
    }

    seenEnvironmentNames.add(environmentName);
  }

  const missingEnvironmentName = LOCAL_SLOT_ENV_NAMES.find(
    (environmentName) => !seenEnvironmentNames.has(environmentName),
  );
  if (missingEnvironmentName !== undefined) {
    throw new Error(
      `Invalid .env.businesses.local: ${missingEnvironmentName} is missing.`,
    );
  }

  let parsedEnvironment: Record<string, string>;
  try {
    parsedEnvironment = parseEnv(normalizedContents);
  } catch {
    throw new Error(
      'Invalid .env.businesses.local: Node.js could not parse the single-line assignments.',
    );
  }

  const localSlotPool: Record<string, string> = {};
  for (const environmentName of LOCAL_SLOT_ENV_NAMES) {
    const value = parsedEnvironment[environmentName];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `Invalid .env.businesses.local: ${environmentName} must have a non-empty value.`,
      );
    }
    localSlotPool[environmentName] = value;
  }

  if (
    Object.keys(parsedEnvironment).some(
      (environmentName) => !LOCAL_SLOT_ENV_NAME_SET.has(environmentName),
    )
  ) {
    throw new Error(
      'Invalid .env.businesses.local: unknown environment keys are not allowed.',
    );
  }

  return localSlotPool;
}

export function readLocalBusinessesSlotPool(
  readLocalFile: LocalEnvFileReader = readFileSync as LocalEnvFileReader,
): Readonly<Record<string, string>> {
  let fileContents: string;
  try {
    fileContents = readLocalFile(LOCAL_BUSINESSES_ENV_FILE, 'utf8');
  } catch {
    throw new Error(
      'Unable to read businesses/.env.businesses.local. Create it from the local example and keep it untracked.',
    );
  }

  return parseLocalBusinessesEnvFile(fileContents);
}

function isSensitiveLauncherEnvironmentName(environmentName: string): boolean {
  const normalizedName = environmentName.toUpperCase();

  return (
    normalizedName.startsWith(LOCAL_SLOT_ENV_PREFIX) ||
    normalizedName.startsWith('BUSINESSES_LOCAL_') ||
    normalizedName.startsWith('PLAYWRIGHT_BLOB_') ||
    normalizedName.startsWith('PLAYWRIGHT_HTML_') ||
    normalizedName === 'PWTEST_BLOB_DO_NOT_REMOVE' ||
    normalizedName === 'PW_TEST_REPORTER' ||
    normalizedName === RESOURCE_SLOT_ENV ||
    normalizedName === EXPECTED_SLOT_ID_ENV ||
    normalizedName === GLOBAL_STATE_ENV ||
    normalizedName === CAPTURE_ARTIFACTS_ENV ||
    normalizedName === PLAYWRIGHT_DEBUG_ENV ||
    normalizedName === DEBUG_ENV ||
    normalizedName.startsWith(TESTOMATIO_ENV_PREFIX)
  );
}

export function stripLocalSlotEnvironment(
  environment: NodeJS.ProcessEnv,
): void {
  for (const environmentName of Object.keys(environment)) {
    if (isSensitiveLauncherEnvironmentName(environmentName)) {
      delete environment[environmentName];
    }
  }
}

export function prepareLocalPlaywrightEnvironment(
  sourceEnvironment: NodeJS.ProcessEnv,
  slotId: string,
  localSlotPool: Readonly<Record<string, string>>,
): NodeJS.ProcessEnv {
  const selectedSlotEnvironmentName = getLocalSlotEnvironmentName(slotId);
  const selectedSlotJson = localSlotPool[selectedSlotEnvironmentName];

  if (
    typeof selectedSlotJson !== 'string' ||
    selectedSlotJson.trim().length === 0
  ) {
    throw new Error(
      `${selectedSlotEnvironmentName} is required in .env.businesses.local.`,
    );
  }

  // Reuse the production provider contract without printing any configured
  // value. This verifies the complete schema and the selected SLOT_ID.
  parseResourceSlot(selectedSlotJson, slotId);

  const childEnvironment: NodeJS.ProcessEnv = { ...sourceEnvironment };
  stripLocalSlotEnvironment(childEnvironment);
  childEnvironment[RESOURCE_SLOT_ENV] = selectedSlotJson;
  childEnvironment[EXPECTED_SLOT_ID_ENV] = slotId;
  childEnvironment[LOCAL_FAILURE_SCREENSHOTS_ENV] = 'true';

  return childEnvironment;
}

export function buildLocalPlaywrightArguments(
  forwardedArguments: readonly string[],
  outputDirectory?: string,
): string[] {
  const playwrightCli = require.resolve('@playwright/test/cli');

  if (
    outputDirectory !== undefined &&
    (!path.isAbsolute(outputDirectory) ||
      !isStrictDescendant(LOCAL_BUSINESSES_RESULTS_ROOT, outputDirectory))
  ) {
    throw new Error(
      'The local Playwright output directory must be beneath businesses/test-results/local/.',
    );
  }

  return [
    playwrightCli,
    'test',
    '--config',
    path.join(businessesDirectory, 'playwright.config.ts'),
    '--workers=1',
    ...(outputDirectory ? [`--output=${outputDirectory}`] : []),
    ...forwardedArguments,
  ];
}

export function runLocalBusinessesTests(
  launcherArguments: readonly string[] = process.argv.slice(2),
): number {
  const { slotId, playwrightArgs } =
    parseLocalLauncherArguments(launcherArguments);
  const localSlotPool = readLocalBusinessesSlotPool();
  // Validate before deleting the previous report so a malformed local secret
  // cannot erase the last useful run.
  const childEnvironment = prepareLocalPlaywrightEnvironment(
    process.env,
    slotId,
    localSlotPool,
  );
  const lease = acquireLocalResultsLease();
  const releaseOnExit = (): void => lease.release();
  process.once('exit', releaseOnExit);

  try {
    resetLocalBusinessesResults();
    const runPaths = createLocalSingleRunPaths(slotId);
    createPrivateDirectory(runPaths.rootDirectory);
    childEnvironment[LOCAL_SINGLE_RUN_ENV] = 'true';
    childEnvironment[LOCAL_SINGLE_HTML_ENV] = runPaths.htmlDirectory;
    childEnvironment[LOCAL_SINGLE_OUTPUT_ENV] = runPaths.outputDirectory;

    const result = spawnSync(
      process.execPath,
      buildLocalPlaywrightArguments(
        playwrightArgs,
        runPaths.outputDirectory,
      ),
      {
        cwd: businessesDirectory,
        env: childEnvironment,
        stdio: 'inherit',
      },
    );

    if (result.error !== undefined) {
      throw new Error(`Unable to start Playwright: ${result.error.message}`);
    }

    if (result.signal !== null) {
      throw new Error(
        `Playwright stopped after receiving signal ${result.signal}.`,
      );
    }

    const htmlIndex = path.join(runPaths.htmlDirectory, 'index.html');
    if (existsSync(htmlIndex)) {
      const relativeHtmlDirectory = path.relative(
        businessesDirectory,
        runPaths.htmlDirectory,
      );
      process.stdout.write(
        `HTML report: ${relativeHtmlDirectory}\n` +
          `Open it with: npx playwright show-report "${relativeHtmlDirectory}"\n`,
      );
    }

    return result.status ?? 1;
  } finally {
    process.removeListener('exit', releaseOnExit);
    lease.release();
  }
}

if (require.main === module) {
  try {
    process.exitCode = runLocalBusinessesTests();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown launcher error.';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
