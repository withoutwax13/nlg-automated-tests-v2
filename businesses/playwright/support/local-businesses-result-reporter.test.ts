import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

import LocalBusinessesResultReporter, {
  aggregateLocalSlotResults,
  parseLocalBusinessesResultIpcMessage,
  parseLocalSlotResultSummary,
  type LocalBusinessesResultIpcMessage,
  type LocalSlotResultSummary,
} from './local-businesses-result-reporter';

const SECRET_MARKER = 'never-persist-this-secret';

function fakeTest(rootDirectory: string): TestCase {
  return {
    expectedStatus: 'passed',
    location: {
      file: path.join(rootDirectory, 'playwright', 'e2e', 'sample.spec.ts'),
      line: 17,
      column: 3,
    },
    retry: 0,
    retries: 0,
    repeatEachIndex: 0,
    title: SECRET_MARKER,
    outcome: () => 'unexpected',
  } as unknown as TestCase;
}

function fakeResult(): TestResult {
  return {
    attachments: [
      {
        name: 'private',
        contentType: 'text/plain',
        body: Buffer.from(SECRET_MARKER),
      },
    ],
    duration: 123.4,
    error: { message: SECRET_MARKER },
    errors: [{ message: SECRET_MARKER }],
    retry: 0,
    status: 'failed',
    stderr: [SECRET_MARKER],
    stdout: [SECRET_MARKER],
  } as unknown as TestResult;
}

function validSummary(
  slotId: string,
  status: LocalSlotResultSummary['status'],
): LocalSlotResultSummary {
  const isFinal = status !== 'running';
  return {
    schemaVersion: 1,
    slotId,
    status,
    startedAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:01.000Z',
    ...(isFinal
      ? {
          finishedAt: '2026-08-20T00:00:01.000Z',
          durationMs: 1000,
        }
      : {}),
    globalErrorCount: 0,
    totals: {
      discovered: 1,
      completed: isFinal ? 1 : 0,
      attempts: isFinal ? 1 : 0,
      passed: status === 'passed' ? 1 : 0,
      failed: status === 'failed' ? 1 : 0,
      timedOut: 0,
      skipped: 0,
      interrupted: 0,
    },
    activeTests: isFinal
      ? []
      : [
          {
            testIndex: 0,
            file: 'playwright/e2e/sample.spec.ts',
            line: 17,
            column: 3,
          },
        ],
    results: isFinal
      ? [
          {
            testIndex: 0,
            file: 'playwright/e2e/sample.spec.ts',
            line: 17,
            column: 3,
            status: status === 'failed' ? 'failed' : 'passed',
            expectedStatus: 'passed',
            outcome: status === 'failed' ? 'unexpected' : 'expected',
            durationMs: 1000,
            retry: 0,
            errorCount: status === 'failed' ? 1 : 0,
          },
        ]
      : [],
  };
}

function loadBusinessesConfig(
  environment: Readonly<Record<string, string | undefined>>,
): Record<string, unknown> {
  const configModule = require.resolve('../../playwright.config');
  const originalEnvironment = new Map<string, string | undefined>();
  for (const [name, value] of Object.entries(environment)) {
    originalEnvironment.set(name, process.env[name]);
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  try {
    delete require.cache[configModule];
    return require(configModule).default as Record<string, unknown>;
  } finally {
    delete require.cache[configModule];
    for (const [name, value] of originalEnvironment) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

function main(): void {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), 'businesses-result-summary-'),
  );
  const localReportsDirectory = path.resolve(
    __dirname,
    '..',
    '..',
    'test-results',
    'local',
    'reports',
  );
  mkdirSync(localReportsDirectory, { recursive: true });
  const configReportDirectory = mkdtempSync(
    path.join(localReportsDirectory, 'reporter-config-test-'),
  );
  const ipcMessages: unknown[] = [];
  const processSendDescriptor = Object.getOwnPropertyDescriptor(process, 'send');
  Object.defineProperty(process, 'send', {
    configurable: true,
    writable: true,
    value: (message: unknown) => {
      ipcMessages.push(message);
      return true;
    },
  });

  try {
    const outputFile = path.join(temporaryDirectory, 'slot-00-summary.json');
    const rootDirectory = path.join(temporaryDirectory, 'businesses');
    const test = fakeTest(rootDirectory);
    let nowIndex = 0;
    const times = [
      '2026-08-20T00:00:00.000Z',
      '2026-08-20T00:00:00.100Z',
      '2026-08-20T00:00:00.200Z',
      '2026-08-20T00:00:00.300Z',
      '2026-08-20T00:00:01.000Z',
      '2026-08-20T00:00:01.100Z',
    ].map((value) => new Date(value));
    const reporter = new LocalBusinessesResultReporter({
      slotId: 'slot-00',
      outputFile,
      now: () => times[Math.min(nowIndex++, times.length - 1)],
    });
    assert.equal(reporter.printsToStdio(), true);
    const config = {
      rootDir: rootDirectory,
      projects: [{ outputDir: temporaryDirectory }],
    } as unknown as FullConfig;
    const suite = { allTests: () => [test] } as unknown as Suite;

    reporter.onBegin(config, suite);
    reporter.onTestBegin(test);
    let running = parseLocalSlotResultSummary(
      JSON.parse(readFileSync(outputFile, 'utf8')),
      'slot-00',
    );
    assert.equal(running.status, 'running');
    assert.equal(running.activeTests.length, 1);
    assert.equal(running.activeTests[0].file, 'playwright/e2e/sample.spec.ts');

    reporter.onTestEnd(test, fakeResult());
    reporter.onError();
    reporter.onEnd({
      status: 'failed',
      duration: 1000,
      startTime: new Date('2026-08-20T00:00:00.000Z'),
    } as FullResult);

    const rawSummary = readFileSync(outputFile, 'utf8');
    assert.equal(rawSummary.includes(SECRET_MARKER), false);
    assert.equal(rawSummary.includes(rootDirectory), false);
    assert.equal(rawSummary.includes('attachments'), false);
    assert.equal(rawSummary.includes('stdout'), false);
    assert.equal(rawSummary.includes('stderr'), false);
    const finalSummary = parseLocalSlotResultSummary(
      JSON.parse(rawSummary),
      'slot-00',
    );
    assert.equal(finalSummary.status, 'failed');
    assert.equal(finalSummary.globalErrorCount, 1);
    assert.deepEqual(finalSummary.totals, {
      discovered: 1,
      completed: 1,
      attempts: 1,
      passed: 0,
      failed: 1,
      timedOut: 0,
      skipped: 0,
      interrupted: 0,
    });
    assert.equal(finalSummary.results[0].errorCount, 1);
    assert.equal(finalSummary.activeTests.length, 0);
    assert.equal(
      existsSync(`${outputFile}.${process.pid}.1.tmp`),
      false,
    );

    assert.equal(ipcMessages.length, 3);
    const parsedIpcMessages = ipcMessages.map((message) =>
      parseLocalBusinessesResultIpcMessage(message, 'slot-00'),
    );
    assert.deepEqual(
      parsedIpcMessages.map((message) => message.event),
      ['begin', 'test-end', 'end'],
    );
    assert.equal(
      parsedIpcMessages.some((message) => message.slotId !== 'slot-00'),
      false,
    );
    assert.equal(JSON.stringify(parsedIpcMessages).includes(SECRET_MARKER), false);
    assert.equal(JSON.stringify(parsedIpcMessages).includes(rootDirectory), false);
    const testEndMessage = parsedIpcMessages[1] as Extract<
      LocalBusinessesResultIpcMessage,
      { event: 'test-end' }
    >;
    assert.equal(testEndMessage.result.file, 'playwright/e2e/sample.spec.ts');
    assert.equal(testEndMessage.result.status, 'failed');
    const endMessage = parsedIpcMessages[2] as Extract<
      LocalBusinessesResultIpcMessage,
      { event: 'end' }
    >;
    assert.equal(endMessage.status, 'failed');
    assert.equal(endMessage.globalErrorCount, 1);

    const sanitizedIpcMessage = parseLocalBusinessesResultIpcMessage(
      {
        ...testEndMessage,
        privateValue: SECRET_MARKER,
        result: { ...testEndMessage.result, privateValue: SECRET_MARKER },
      },
      'slot-00',
    );
    assert.equal(JSON.stringify(sanitizedIpcMessage).includes(SECRET_MARKER), false);
    assert.throws(
      () => parseLocalBusinessesResultIpcMessage(testEndMessage, 'slot-01'),
      /Invalid local Businesses result IPC message/,
    );

    const sanitizedParsedSummary = parseLocalSlotResultSummary(
      {
        ...finalSummary,
        privateValue: SECRET_MARKER,
        totals: { ...finalSummary.totals, privateValue: SECRET_MARKER },
        results: [
          { ...finalSummary.results[0], privateValue: SECRET_MARKER },
        ],
      },
      'slot-00',
    );
    assert.equal(
      JSON.stringify(sanitizedParsedSummary).includes(SECRET_MARKER),
      false,
    );

    assert.throws(
      () => parseLocalSlotResultSummary(finalSummary, 'slot-01'),
      /slot-01/,
    );
    assert.throws(
      () =>
        parseLocalSlotResultSummary(
          { ...finalSummary, totals: { ...finalSummary.totals, completed: 2 } },
          'slot-00',
        ),
      /Invalid local Businesses result summary/,
    );

    const aggregate = aggregateLocalSlotResults(
      ['slot-00', 'slot-01', 'slot-02', 'slot-03', 'slot-04'],
      {
        'slot-00': validSummary('slot-00', 'passed'),
        'slot-01': validSummary('slot-01', 'failed'),
        'slot-02': validSummary('slot-02', 'running'),
        'slot-03': { slotId: SECRET_MARKER },
      },
    );
    assert.equal(aggregate.complete, false);
    assert.equal(aggregate.passed, false);
    assert.deepEqual(aggregate.failedSlotIds, ['slot-01']);
    assert.deepEqual(aggregate.incompleteSlotIds, [
      'slot-02',
      'slot-03',
      'slot-04',
    ]);
    assert.deepEqual(aggregate.stalledSlotIds, []);
    assert.deepEqual(aggregate.totals, {
      discovered: 3,
      completed: 2,
      active: 1,
    });
    assert.deepEqual(
      aggregate.slots.map(({ slotId, status }) => ({ slotId, status })),
      [
        { slotId: 'slot-00', status: 'passed' },
        { slotId: 'slot-01', status: 'failed' },
        { slotId: 'slot-02', status: 'running' },
        { slotId: 'slot-03', status: 'invalid' },
        { slotId: 'slot-04', status: 'missing' },
      ],
    );
    assert.equal(JSON.stringify(aggregate).includes(SECRET_MARKER), false);

    const stalled = aggregateLocalSlotResults(
      ['slot-02'],
      { 'slot-02': validSummary('slot-02', 'running') },
      {
        now: new Date('2026-08-20T00:00:06.000Z'),
        staleAfterMs: 5000,
      },
    );
    assert.deepEqual(stalled.stalledSlotIds, ['slot-02']);
    assert.deepEqual(stalled.incompleteSlotIds, ['slot-02']);
    assert.equal(stalled.slots[0].status, 'stalled');

    const complete = aggregateLocalSlotResults(
      ['slot-00', 'slot-01'],
      {
        'slot-00': validSummary('slot-00', 'passed'),
        'slot-01': validSummary('slot-01', 'passed'),
      },
    );
    assert.equal(complete.complete, true);
    assert.equal(complete.passed, true);
    assert.deepEqual(complete.failedSlotIds, []);
    assert.deepEqual(complete.incompleteSlotIds, []);
    assert.deepEqual(complete.stalledSlotIds, []);

    assert.throws(
      () => aggregateLocalSlotResults(['slot-00', 'slot-00'], {}),
      /unique/,
    );
    assert.throws(
      () =>
        aggregateLocalSlotResults(['slot-00'], {}, { staleAfterMs: 0 }),
      /positive number of milliseconds/,
    );

    const configEnvironment = {
      BUSINESSES_LOCAL_PARALLEL: 'true',
      BUSINESSES_LOCAL_SINGLE: undefined,
      BUSINESSES_LOCAL_FAILURE_SCREENSHOTS: 'true',
      BUSINESSES_EXPECTED_SLOT_ID: 'slot-00',
      BUSINESSES_LOCAL_RESULT_FILE: path.join(
        configReportDirectory,
        'slot-result-summary.json',
      ),
      PLAYWRIGHT_BLOB_OUTPUT_DIR: path.join(configReportDirectory, 'slot-blob'),
      PLAYWRIGHT_BLOB_OUTPUT_NAME: 'report.zip',
      PLAYWRIGHT_BLOB_OUTPUT_FILE: undefined,
      BUSINESSES_LOCAL_OUTPUT_DIR: undefined,
      BUSINESSES_LOCAL_HTML_OUTPUT_DIR: undefined,
      E2E_CAPTURE_ARTIFACTS: undefined,
      TESTOMATIO: SECRET_MARKER,
    };
    const localConfig = loadBusinessesConfig(configEnvironment);
    const timeoutConfig = localConfig as {
      timeout?: number;
      expect?: { timeout?: number };
      use?: {
        actionTimeout?: number;
        navigationTimeout?: number;
        screenshot?: string;
        video?: string;
        trace?: string;
      };
    };
    assert.equal(timeoutConfig.timeout, 180_000);
    assert.equal(timeoutConfig.expect?.timeout, 20_000);
    assert.equal(timeoutConfig.use?.actionTimeout, 30_000);
    assert.equal(timeoutConfig.use?.navigationTimeout, 60_000);
    assert.equal(timeoutConfig.use?.screenshot, 'only-on-failure');
    assert.equal(timeoutConfig.use?.video, 'off');
    assert.equal(timeoutConfig.use?.trace, 'off');
    const localReporters = localConfig.reporter as Array<
      [string, Record<string, unknown>?]
    >;
    assert.equal(localReporters.length, 2);
    assert.equal(localReporters[0][0], 'blob');
    assert.match(
      localReporters[1][0],
      /local-businesses-result-reporter(?:\.ts)?$/,
    );
    assert.deepEqual(localReporters[1][1], {
      slotId: 'slot-00',
      outputFile: configEnvironment.BUSINESSES_LOCAL_RESULT_FILE,
    });
    assert.equal(JSON.stringify(localReporters).includes(SECRET_MARKER), false);

    const singleRunRoot = path.join(
      localReportsDirectory,
      '..',
      'single',
      'config-test',
    );
    const singleOutputDirectory = path.join(singleRunRoot, 'output');
    const singleHtmlDirectory = path.join(singleRunRoot, 'html');
    const singleConfig = loadBusinessesConfig({
      ...configEnvironment,
      BUSINESSES_LOCAL_PARALLEL: undefined,
      BUSINESSES_LOCAL_SINGLE: 'true',
      BUSINESSES_LOCAL_OUTPUT_DIR: singleOutputDirectory,
      BUSINESSES_LOCAL_HTML_OUTPUT_DIR: singleHtmlDirectory,
    });
    assert.equal(singleConfig.outputDir, singleOutputDirectory);
    const singleReporters = singleConfig.reporter as Array<
      [string, Record<string, unknown>?]
    >;
    assert.equal(singleReporters.length, 2);
    assert.equal(singleReporters[0][0], 'list');
    assert.equal(singleReporters[1][0], 'html');
    assert.deepEqual(singleReporters[1][1], {
      outputFolder: singleHtmlDirectory,
      open: 'never',
    });
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          BUSINESSES_LOCAL_SINGLE: 'true',
        }),
      /cannot be both local single-slot and local parallel/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          BUSINESSES_LOCAL_PARALLEL: undefined,
          BUSINESSES_LOCAL_SINGLE: 'true',
          BUSINESSES_LOCAL_OUTPUT_DIR: singleOutputDirectory,
          BUSINESSES_LOCAL_HTML_OUTPUT_DIR: path.join(
            temporaryDirectory,
            'outside-html',
          ),
        }),
      /must resolve beneath businesses\/test-results\/local/,
    );

    const regularConfig = loadBusinessesConfig({
      ...configEnvironment,
      BUSINESSES_LOCAL_PARALLEL: undefined,
      BUSINESSES_LOCAL_SINGLE: undefined,
      BUSINESSES_LOCAL_FAILURE_SCREENSHOTS: undefined,
    });
    const regularReporters = regularConfig.reporter as Array<
      [string, Record<string, unknown>?]
    >;
    assert.equal(regularReporters[0][0], 'list');
    assert.equal(
      regularReporters.some(
        ([reporterName]) => reporterName === '@testomatio/reporter/playwright',
      ),
      true,
    );
    const regularUse = regularConfig.use as {
      screenshot?: string;
      video?: string;
      trace?: string;
    };
    assert.equal(regularUse.screenshot, 'off');
    assert.equal(regularUse.video, 'off');
    assert.equal(regularUse.trace, 'off');

    const optedInArtifactConfig = loadBusinessesConfig({
      ...configEnvironment,
      BUSINESSES_LOCAL_PARALLEL: undefined,
      BUSINESSES_LOCAL_SINGLE: undefined,
      BUSINESSES_LOCAL_FAILURE_SCREENSHOTS: undefined,
      E2E_CAPTURE_ARTIFACTS: 'true',
    });
    const optedInUse = optedInArtifactConfig.use as {
      screenshot?: string;
      video?: string;
      trace?: string;
    };
    assert.equal(optedInUse.screenshot, 'only-on-failure');
    assert.equal(optedInUse.video, 'retain-on-failure');
    assert.equal(optedInUse.trace, 'off');
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          BUSINESSES_LOCAL_RESULT_FILE: 'relative-result.json',
        }),
      /BUSINESSES_LOCAL_RESULT_FILE must be an absolute/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          PLAYWRIGHT_BLOB_OUTPUT_DIR: 'relative-blob',
        }),
      /PLAYWRIGHT_BLOB_OUTPUT_DIR must be an absolute/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          BUSINESSES_LOCAL_RESULT_FILE: path.join(
            temporaryDirectory,
            'outside-result.json',
          ),
        }),
      /must resolve beneath businesses\/test-results\/local\/reports/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          PLAYWRIGHT_BLOB_OUTPUT_DIR: path.join(
            temporaryDirectory,
            'outside-blob',
          ),
        }),
      /must resolve beneath businesses\/test-results\/local\/reports/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          PLAYWRIGHT_BLOB_OUTPUT_NAME: '../unsafe.zip',
        }),
      /PLAYWRIGHT_BLOB_OUTPUT_NAME must be report\.zip/,
    );
    assert.throws(
      () =>
        loadBusinessesConfig({
          ...configEnvironment,
          PLAYWRIGHT_BLOB_OUTPUT_FILE: path.join(
            configReportDirectory,
            'unsafe-priority.zip',
          ),
        }),
      /PLAYWRIGHT_BLOB_OUTPUT_FILE must be unset/,
    );
  } finally {
    if (processSendDescriptor) {
      Object.defineProperty(process, 'send', processSendDescriptor);
    } else {
      delete (process as unknown as Record<string, unknown>).send;
    }
    rmSync(temporaryDirectory, { recursive: true, force: true });
    rmSync(configReportDirectory, { recursive: true, force: true });
  }

  process.stdout.write('Businesses local result reporter tests passed.\n');
}

main();
