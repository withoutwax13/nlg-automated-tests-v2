import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  acquireLocalResultsLease,
  buildLocalPlaywrightArguments,
  createLocalSingleRunPaths,
  getLocalSlotEnvironmentName,
  LOCAL_FILINGS_ENV_FILE,
  LOCAL_FILINGS_RESULTS_LOCK,
  LOCAL_FILINGS_RESULTS_ROOT,
  parseLocalFilingsEnvFile,
  parseLocalLauncherArguments,
  prepareLocalPlaywrightEnvironment,
  readLocalFilingsSlotPool,
  resetLocalFilingsResults,
  stripLocalSlotEnvironment,
} from './local-filings-launcher';
import { parseResourceSlot } from './resource-pool';

const RESOURCE_SLOT_ENV = 'FILINGS_RESOURCE_SLOT_JSON';
const EXPECTED_SLOT_ID_ENV = 'FILINGS_EXPECTED_SLOT_ID';

function createPayload(slotId = 'slot-03') {
  return {
    VERSION: 1,
    SLOT_ID: slotId,
    TAXPAYER_USERNAME: 'taxpayer@example.invalid',
    TAXPAYER_PASSWORD: 'taxpayer-password',
    MUNICIPAL_USERNAME: 'municipal@example.invalid',
    MUNICIPAL_PASSWORD: 'municipal-password',
    AGS_USERNAME: 'ags@example.invalid',
    AGS_PASSWORD: 'ags-password',
    MUNICIPALITY: 'Test Municipality',
    RESET_MUNICIPALITY: 'Reset Municipality',
    ACTIVE_BUSINESS: 'Active Business',
    INACTIVE_BUSINESS: 'Inactive Business',
    REQUIRED_FORMS_BUSINESS: 'Required Forms Business',
    DELINQUENCY_BUSINESS: 'Delinquency Business',
    FILINGS_BUSINESS: 'Filings Business',
    DEFAULT_BUSINESS: 'Default Business',
    FUNDED_BUSINESS: 'Default Business',
    DRAFT_BUSINESS: 'Default Business',
    ZERO_PAYMENT_BUSINESS: 'Filings Business',
  };
}

function expectArgumentError(argumentsToParse: string[], expected: RegExp): void {
  assert.throws(() => parseLocalLauncherArguments(argumentsToParse), expected);
}

function createLocalEnvFile(): string {
  const assignments = Array.from({ length: 10 }, (_, index) => {
    const slotId = `slot-${String(index).padStart(2, '0')}`;
    const environmentName = `BUSINESSES_SLOT_${String(index).padStart(2, '0')}`;
    return `${environmentName}=${JSON.stringify(createPayload(slotId))}`;
  });

  return ['# Local placeholder pool', '', ...assignments, ''].join('\n');
}

const parsedArguments = parseLocalLauncherArguments([
  '--slot=slot-03',
  '--grep',
  'TC39',
  '--headed',
]);
assert.deepEqual(parsedArguments, {
  slotId: 'slot-03',
  playwrightArgs: ['--grep', 'TC39', '--headed'],
});
assert.equal(getLocalSlotEnvironmentName('slot-03'), 'BUSINESSES_SLOT_03');

expectArgumentError([], /requires --slot=slot-NN/);
expectArgumentError(['--slot', 'slot-03'], /with an equals sign/);
expectArgumentError(['--slot=slot-10'], /slot-00 through slot-09/);
expectArgumentError(
  ['--slot=slot-03', '--slot=slot-03'],
  /exactly one --slot argument/,
);

for (const managedArgument of [
  '--workers',
  '--workers=1',
  '-j',
  '-j1',
  '-j50%',
  '--shard',
  '--shard=1/2',
  '--config',
  '--config=other.config.ts',
  '-c',
  '-cother.config.ts',
  '-c-override.config.ts',
  '--ui',
  '--ui-host=127.0.0.1',
  '--debug',
  '--pass-with-no-tests',
  '--pass-with-no-tests=true',
  '--retries=1',
  '--retries-unsafe-alias',
  '--repeat-each',
  '--repeat-each=2',
  '--reporter=list',
  '--reporter-output=private',
  '--trace=on',
  '--trace-dir=private',
  '--output',
  '--output=private-results',
]) {
  expectArgumentError(
    ['--slot=slot-03', managedArgument],
    /blocked by the local Filings launcher safety policy/,
  );
}

for (const allowedArguments of [
  ['--headed'],
  ['--grep', 'TC39'],
  ['--list'],
]) {
  assert.deepEqual(
    parseLocalLauncherArguments(['--slot=slot-03', ...allowedArguments])
      .playwrightArgs,
    allowedArguments,
  );
}

const localEnvFile = createLocalEnvFile();
const parsedLocalSlotPool = parseLocalFilingsEnvFile(localEnvFile);
assert.equal(Object.keys(parsedLocalSlotPool).length, 10);
assert.equal(
  parsedLocalSlotPool.BUSINESSES_SLOT_03,
  JSON.stringify(createPayload('slot-03')),
);

const committedExamplePath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'businesses',
  '.env.businesses.local.example',
);
const committedExamplePool = parseLocalFilingsEnvFile(
  readFileSync(committedExamplePath, 'utf8'),
);
for (let index = 0; index < 10; index += 1) {
  const slotNumber = String(index).padStart(2, '0');
  parseResourceSlot(
    committedExamplePool[`BUSINESSES_SLOT_${slotNumber}`],
    `slot-${slotNumber}`,
  );
}

let requestedFilePath = '';
let requestedEncoding = '';
const readLocalSlotPool = readLocalFilingsSlotPool((filePath, encoding) => {
  requestedFilePath = filePath;
  requestedEncoding = encoding;
  return localEnvFile;
});
assert.equal(requestedFilePath, LOCAL_FILINGS_ENV_FILE);
assert.match(requestedFilePath, /businesses[\\/]\.env\.businesses\.local$/);
assert.equal(requestedEncoding, 'utf8');
assert.equal(readLocalSlotPool.BUSINESSES_SLOT_09, JSON.stringify(createPayload('slot-09')));

const privateSentinel = 'private-value-that-must-not-appear-in-errors';
assert.throws(
  () =>
    parseLocalFilingsEnvFile(
      `${localEnvFile}BUSINESSES_SLOT_03=${privateSentinel}\n`,
    ),
  (error: unknown) => {
    assert(error instanceof Error);
    assert.match(error.message, /assigned more than once/);
    assert.doesNotMatch(error.message, new RegExp(privateSentinel));
    return true;
  },
);
assert.throws(
  () =>
    parseLocalFilingsEnvFile(
      localEnvFile.replace(
        'BUSINESSES_SLOT_00=',
        `UNKNOWN_LOCAL_SECRET=${privateSentinel}`,
      ),
    ),
  (error: unknown) => {
    assert(error instanceof Error);
    assert.match(error.message, /only BUSINESSES_SLOT_00 through BUSINESSES_SLOT_09/);
    assert.doesNotMatch(error.message, new RegExp(privateSentinel));
    return true;
  },
);
assert.throws(
  () =>
    parseLocalFilingsEnvFile(
      localEnvFile
        .split('\n')
        .filter((line) => !line.startsWith('BUSINESSES_SLOT_09='))
        .join('\n'),
    ),
  /BUSINESSES_SLOT_09 is missing/,
);
assert.throws(
  () =>
    parseLocalFilingsEnvFile(
      localEnvFile.replace(
        /^BUSINESSES_SLOT_03=.*$/m,
        "BUSINESSES_SLOT_03='first line\nsecond line'",
      ),
    ),
  /each value must use one KEY=value line/,
);
assert.throws(
  () => readLocalFilingsSlotPool(() => {
    throw new Error(privateSentinel);
  }),
  (error: unknown) => {
    assert(error instanceof Error);
    assert.match(error.message, /Unable to read businesses\/\.env\.businesses\.local/);
    assert.doesNotMatch(error.message, new RegExp(privateSentinel));
    return true;
  },
);

const selectedSlotJson = JSON.stringify(createPayload());
const sourceEnvironment: NodeJS.ProcessEnv = {
  PATH: 'placeholder-path',
  KEEP_ME: 'preserved',
  BUSINESSES_SLOT_00: 'unselected-secret-00',
  BUSINESSES_SLOT_03: 'ambient-slot-must-not-override-the-file',
  BUSINESSES_SLOT_09: 'unselected-secret-09',
  BUSINESSES_SLOT_EXTRA: 'also-remove-this',
  businesses_slot_lowercase: 'remove-case-insensitively',
  FILINGS_SLOT_00: 'stale-filings-repository-secret',
  BUSINESSES_RESOURCE_SLOT_JSON: 'stale-businesses-selected-slot',
  BUSINESSES_EXPECTED_SLOT_ID: 'slot-08',
  [RESOURCE_SLOT_ENV]: 'stale-selected-slot',
  [EXPECTED_SLOT_ID_ENV]: 'slot-09',
  E2E_RUN_GLOBAL_STATE: 'true',
  E2E_CAPTURE_ARTIFACTS: 'true',
  PWDEBUG: '1',
  DEBUG: '*',
  TESTOMATIO: 'testomatio-project-secret',
  TESTOMATIO_RUN: 'testomatio-run-secret',
  testomatio_custom: 'testomatio-case-insensitive-secret',
  FILINGS_LOCAL_FAILURE_SCREENSHOTS: 'false',
  FILINGS_LOCAL_SINGLE: 'true',
  FILINGS_LOCAL_PARALLEL: 'true',
  FILINGS_LOCAL_RESULT_FILE: 'unsafe-result.json',
  PLAYWRIGHT_BLOB_OUTPUT_DIR: 'unsafe-blob',
  PLAYWRIGHT_BLOB_OUTPUT_NAME: 'unsafe.zip',
  PLAYWRIGHT_HTML_OUTPUT_DIR: 'unsafe-html',
  PWTEST_BLOB_DO_NOT_REMOVE: '1',
  PW_TEST_REPORTER: 'unsafe-reporter',
};

const childEnvironment = prepareLocalPlaywrightEnvironment(
  sourceEnvironment,
  'slot-03',
  parsedLocalSlotPool,
);

assert.equal(childEnvironment.PATH, 'placeholder-path');
assert.equal(childEnvironment.KEEP_ME, 'preserved');
assert.equal(childEnvironment[RESOURCE_SLOT_ENV], selectedSlotJson);
assert.equal(childEnvironment[EXPECTED_SLOT_ID_ENV], 'slot-03');
assert.equal(childEnvironment.E2E_RUN_GLOBAL_STATE, undefined);
assert.equal(childEnvironment.E2E_CAPTURE_ARTIFACTS, undefined);
assert.equal(childEnvironment.PWDEBUG, undefined);
assert.equal(childEnvironment.DEBUG, undefined);
assert.equal(childEnvironment.TESTOMATIO, undefined);
assert.equal(childEnvironment.TESTOMATIO_RUN, undefined);
assert.equal(childEnvironment.testomatio_custom, undefined);
assert.equal(childEnvironment.FILINGS_LOCAL_FAILURE_SCREENSHOTS, 'true');
assert.equal(childEnvironment.FILINGS_LOCAL_SINGLE, undefined);
assert.equal(childEnvironment.FILINGS_LOCAL_PARALLEL, undefined);
assert.equal(childEnvironment.FILINGS_LOCAL_RESULT_FILE, undefined);
assert.equal(childEnvironment.PLAYWRIGHT_BLOB_OUTPUT_DIR, undefined);
assert.equal(childEnvironment.PLAYWRIGHT_BLOB_OUTPUT_NAME, undefined);
assert.equal(childEnvironment.PLAYWRIGHT_HTML_OUTPUT_DIR, undefined);
assert.equal(childEnvironment.PWTEST_BLOB_DO_NOT_REMOVE, undefined);
assert.equal(childEnvironment.PW_TEST_REPORTER, undefined);
assert.equal(childEnvironment.BUSINESSES_RESOURCE_SLOT_JSON, undefined);
assert.equal(childEnvironment.BUSINESSES_EXPECTED_SLOT_ID, undefined);
assert.equal(childEnvironment.FILINGS_SLOT_00, undefined);
assert.equal(
  Object.keys(childEnvironment).some((key) =>
    key.toUpperCase().startsWith('BUSINESSES_SLOT_'),
  ),
  false,
);

// Environment preparation is pure and scrubs only its child-environment copy.
assert.equal(sourceEnvironment.BUSINESSES_SLOT_00, 'unselected-secret-00');
assert.equal(
  sourceEnvironment.BUSINESSES_SLOT_03,
  'ambient-slot-must-not-override-the-file',
);
stripLocalSlotEnvironment(sourceEnvironment);
assert.equal(sourceEnvironment.BUSINESSES_SLOT_00, undefined);
assert.equal(sourceEnvironment.BUSINESSES_SLOT_03, undefined);
assert.equal(sourceEnvironment.BUSINESSES_SLOT_EXTRA, undefined);
assert.equal(sourceEnvironment.businesses_slot_lowercase, undefined);
assert.equal(sourceEnvironment.BUSINESSES_RESOURCE_SLOT_JSON, undefined);
assert.equal(sourceEnvironment.BUSINESSES_EXPECTED_SLOT_ID, undefined);
assert.equal(sourceEnvironment.FILINGS_SLOT_00, undefined);
assert.equal(sourceEnvironment[RESOURCE_SLOT_ENV], undefined);
assert.equal(sourceEnvironment[EXPECTED_SLOT_ID_ENV], undefined);
assert.equal(sourceEnvironment.E2E_RUN_GLOBAL_STATE, undefined);
assert.equal(sourceEnvironment.E2E_CAPTURE_ARTIFACTS, undefined);
assert.equal(sourceEnvironment.PWDEBUG, undefined);
assert.equal(sourceEnvironment.DEBUG, undefined);
assert.equal(sourceEnvironment.TESTOMATIO, undefined);
assert.equal(sourceEnvironment.TESTOMATIO_RUN, undefined);
assert.equal(sourceEnvironment.testomatio_custom, undefined);
assert.equal(sourceEnvironment.FILINGS_LOCAL_FAILURE_SCREENSHOTS, undefined);
assert.equal(sourceEnvironment.FILINGS_LOCAL_SINGLE, undefined);
assert.equal(sourceEnvironment.FILINGS_LOCAL_PARALLEL, undefined);
assert.equal(sourceEnvironment.FILINGS_LOCAL_RESULT_FILE, undefined);
assert.equal(sourceEnvironment.PLAYWRIGHT_BLOB_OUTPUT_DIR, undefined);
assert.equal(sourceEnvironment.PLAYWRIGHT_HTML_OUTPUT_DIR, undefined);
assert.equal(sourceEnvironment.PW_TEST_REPORTER, undefined);
assert.equal(sourceEnvironment.KEEP_ME, 'preserved');

assert.throws(
  () => prepareLocalPlaywrightEnvironment({}, 'slot-03', {}),
  /BUSINESSES_SLOT_03 is required in \.env\.businesses\.local/,
);
assert.throws(
  () =>
    prepareLocalPlaywrightEnvironment(
      {},
      'slot-03',
      { BUSINESSES_SLOT_03: '{private-invalid-json' },
    ),
  (error: unknown) => {
    assert(error instanceof Error);
    assert.match(error.message, /must contain valid JSON/);
    assert.doesNotMatch(error.message, /private-invalid-json/);
    return true;
  },
);
assert.throws(
  () =>
    prepareLocalPlaywrightEnvironment(
      {},
      'slot-03',
      { BUSINESSES_SLOT_03: JSON.stringify(createPayload('slot-04')) },
    ),
  /SLOT_ID does not match/,
);

const playwrightArguments = buildLocalPlaywrightArguments([
  '--grep',
  'TC39',
]);
assert.match(playwrightArguments[0], /@playwright[\\/]test[\\/]cli\.js$/);
assert.equal(playwrightArguments[1], 'test');
assert.equal(playwrightArguments[2], '--config');
assert.match(playwrightArguments[3], /filings[\\/]playwright\.config\.ts$/);
assert.equal(playwrightArguments[4], '--workers=1');
assert.deepEqual(playwrightArguments.slice(5), ['--grep', 'TC39']);
assert.equal(playwrightArguments.includes('--shard'), false);

const singleRunPaths = createLocalSingleRunPaths(
  'slot-03',
  new Date('2026-08-20T12:34:56.000Z'),
  4321,
);
assert.equal(singleRunPaths.runId, '20260820T123456Z-4321-slot-03');
assert.match(
  singleRunPaths.outputDirectory,
  /test-results[\\/]local[\\/]single[\\/]20260820T123456Z-4321-slot-03[\\/]output$/,
);
assert.match(singleRunPaths.htmlDirectory, /[\\/]html$/);
const isolatedPlaywrightArguments = buildLocalPlaywrightArguments(
  ['--grep=TC39'],
  singleRunPaths.outputDirectory,
);
assert.equal(
  isolatedPlaywrightArguments.includes(
    `--output=${singleRunPaths.outputDirectory}`,
  ),
  true,
);
assert.throws(
  () => buildLocalPlaywrightArguments([], path.join(tmpdir(), 'outside-results')),
  /must be beneath filings\/test-results\/local/,
);

const temporaryRoot = mkdtempSync(
  path.join(tmpdir(), 'filings-local-results-'),
);
try {
  const fakeFilingsDirectory = path.join(temporaryRoot, 'filings');
  const fakeTestResultsDirectory = path.join(
    fakeFilingsDirectory,
    'test-results',
  );
  const fakeLocalResultsDirectory = path.join(
    fakeTestResultsDirectory,
    'local',
  );
  mkdirSync(path.join(fakeLocalResultsDirectory, 'old-run'), {
    recursive: true,
  });
  writeFileSync(
    path.join(fakeLocalResultsDirectory, 'old-run', 'old-result.txt'),
    'old result',
  );
  const siblingSentinel = path.join(fakeTestResultsDirectory, 'keep-me.txt');
  writeFileSync(siblingSentinel, 'preserved sibling');

  resetLocalFilingsResults(
    fakeLocalResultsDirectory,
    fakeFilingsDirectory,
  );
  assert.equal(existsSync(fakeLocalResultsDirectory), true);
  assert.equal(
    existsSync(path.join(fakeLocalResultsDirectory, 'old-run')),
    false,
  );
  assert.equal(readFileSync(siblingSentinel, 'utf8'), 'preserved sibling');
  assert.throws(
    () =>
      resetLocalFilingsResults(
        fakeTestResultsDirectory,
        fakeFilingsDirectory,
      ),
    /Refusing to reset anything except/,
  );

  rmSync(fakeLocalResultsDirectory, { recursive: true, force: true });
  const linkedTarget = path.join(temporaryRoot, 'linked-target');
  mkdirSync(linkedTarget);
  const linkedTargetSentinel = path.join(linkedTarget, 'must-survive.txt');
  writeFileSync(linkedTargetSentinel, 'do not delete through a link');
  symlinkSync(linkedTarget, fakeLocalResultsDirectory, 'junction');
  assert.throws(
    () =>
      resetLocalFilingsResults(
        fakeLocalResultsDirectory,
        fakeFilingsDirectory,
      ),
    /must be an ordinary directory/,
  );
  assert.equal(readFileSync(linkedTargetSentinel, 'utf8'), 'do not delete through a link');
  unlinkSync(fakeLocalResultsDirectory);

  const lockDirectory = path.join(
    temporaryRoot,
    'businesses',
    '.local-businesses-results.lock',
  );
  mkdirSync(path.dirname(lockDirectory), { recursive: true });
  const firstLease = acquireLocalResultsLease(lockDirectory);
  assert.throws(
    () => acquireLocalResultsLease(lockDirectory),
    /Another local Businesses or Filings run owns the shared test resources/,
  );
  firstLease.release();
  const secondLease = acquireLocalResultsLease(lockDirectory);
  secondLease.release();
  assert.equal(existsSync(lockDirectory), false);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

assert.equal(
  path.resolve(LOCAL_FILINGS_RESULTS_ROOT),
  path.resolve(__dirname, '..', '..', 'test-results', 'local'),
);
assert.equal(
  path.resolve(LOCAL_FILINGS_RESULTS_LOCK),
  path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'businesses',
    '.local-businesses-results.lock',
  ),
);

process.stdout.write('Filings local launcher tests passed.\n');
