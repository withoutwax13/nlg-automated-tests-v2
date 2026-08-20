import {
  mkdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

const SUMMARY_SCHEMA_VERSION = 1;
const SLOT_ID_PATTERN = /^slot-0[0-9]$/;
const FINAL_RUN_STATUSES = new Set<LocalSlotRunStatus>([
  'passed',
  'failed',
  'timedout',
  'interrupted',
]);
const RUN_STATUSES = new Set<LocalSlotRunStatus>([
  'running',
  ...FINAL_RUN_STATUSES,
]);
const TEST_STATUSES = new Set<LocalTestStatus>([
  'passed',
  'failed',
  'timedOut',
  'skipped',
  'interrupted',
]);
const TEST_OUTCOMES = new Set<LocalTestOutcome>([
  'expected',
  'unexpected',
  'flaky',
  'skipped',
]);

export type LocalSlotRunStatus = FullResult['status'] | 'running';
export type LocalTestStatus = TestResult['status'];
export type LocalTestOutcome = ReturnType<TestCase['outcome']>;

export interface SafeTestReference {
  testIndex: number;
  file: string;
  line: number;
  column: number;
}

export interface SafeTestResult extends SafeTestReference {
  status: LocalTestStatus;
  expectedStatus: TestCase['expectedStatus'];
  outcome: LocalTestOutcome;
  durationMs: number;
  retry: number;
  errorCount: number;
}

export interface LocalSlotResultTotals {
  discovered: number;
  completed: number;
  attempts: number;
  passed: number;
  failed: number;
  timedOut: number;
  skipped: number;
  interrupted: number;
}

export interface LocalSlotResultSummary {
  schemaVersion: typeof SUMMARY_SCHEMA_VERSION;
  slotId: string;
  status: LocalSlotRunStatus;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
  durationMs?: number;
  globalErrorCount: number;
  totals: LocalSlotResultTotals;
  activeTests: SafeTestReference[];
  results: SafeTestResult[];
}

export interface LocalBusinessesResultReporterOptions {
  slotId?: string;
  outputFile?: string;
  /** Test seam only; Playwright configuration should not pass functions. */
  now?: () => Date;
}

interface LocalBusinessesResultIpcBase {
  type: 'businesses-local-result';
  version: 1;
  slotId: string;
  totals: LocalSlotResultTotals;
}

export interface LocalBusinessesResultBeginIpcMessage
  extends LocalBusinessesResultIpcBase {
  event: 'begin';
  status: 'running';
}

export interface LocalBusinessesResultTestEndIpcMessage
  extends LocalBusinessesResultIpcBase {
  event: 'test-end';
  status: 'running';
  result: SafeTestResult;
}

export interface LocalBusinessesResultEndIpcMessage
  extends LocalBusinessesResultIpcBase {
  event: 'end';
  status: FullResult['status'];
  durationMs: number;
  globalErrorCount: number;
}

export type LocalBusinessesResultIpcMessage =
  | LocalBusinessesResultBeginIpcMessage
  | LocalBusinessesResultTestEndIpcMessage
  | LocalBusinessesResultEndIpcMessage;

export interface AggregatedLocalSlotResult {
  slotId: string;
  status: LocalSlotRunStatus | 'missing' | 'invalid' | 'stalled';
  discovered: number;
  completed: number;
  active: number;
}

export interface LocalParallelAggregationOptions {
  now?: Date;
  staleAfterMs?: number;
}

export interface AggregatedLocalParallelResult {
  complete: boolean;
  passed: boolean;
  failedSlotIds: string[];
  incompleteSlotIds: string[];
  stalledSlotIds: string[];
  totals: {
    discovered: number;
    completed: number;
    active: number;
  };
  slots: AggregatedLocalSlotResult[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !Number.isNaN(Date.parse(value))
  );
}

function isSafeTestReference(value: unknown): value is SafeTestReference {
  if (!isObject(value)) {
    return false;
  }

  return (
    isNonNegativeInteger(value.testIndex) &&
    typeof value.file === 'string' &&
    value.file.length > 0 &&
    value.file.length <= 500 &&
    !path.isAbsolute(value.file) &&
    !value.file.includes('\\') &&
    !value.file.split('/').includes('..') &&
    isNonNegativeInteger(value.line) &&
    isNonNegativeInteger(value.column)
  );
}

function isSafeTestResult(value: unknown): value is SafeTestResult {
  if (!isSafeTestReference(value) || !isObject(value)) {
    return false;
  }

  return (
    TEST_STATUSES.has(value.status as LocalTestStatus) &&
    TEST_STATUSES.has(value.expectedStatus as LocalTestStatus) &&
    TEST_OUTCOMES.has(value.outcome as LocalTestOutcome) &&
    isNonNegativeInteger(value.durationMs) &&
    isNonNegativeInteger(value.retry) &&
    isNonNegativeInteger(value.errorCount)
  );
}

function isLocalSlotResultTotals(
  value: unknown,
): value is LocalSlotResultTotals {
  if (!isObject(value)) {
    return false;
  }

  const keys: Array<keyof LocalSlotResultTotals> = [
    'discovered',
    'completed',
    'attempts',
    'passed',
    'failed',
    'timedOut',
    'skipped',
    'interrupted',
  ];
  if (!keys.every((key) => isNonNegativeInteger(value[key]))) {
    return false;
  }

  const totals = value as unknown as LocalSlotResultTotals;
  return (
    totals.completed ===
      totals.passed +
        totals.failed +
        totals.timedOut +
        totals.skipped +
        totals.interrupted &&
    totals.completed <= totals.discovered &&
    totals.attempts >= totals.completed
  );
}

function sanitizedTotals(value: LocalSlotResultTotals): LocalSlotResultTotals {
  return {
    discovered: value.discovered,
    completed: value.completed,
    attempts: value.attempts,
    passed: value.passed,
    failed: value.failed,
    timedOut: value.timedOut,
    skipped: value.skipped,
    interrupted: value.interrupted,
  };
}

function sanitizedTestResult(value: SafeTestResult): SafeTestResult {
  return {
    testIndex: value.testIndex,
    file: value.file,
    line: value.line,
    column: value.column,
    status: value.status,
    expectedStatus: value.expectedStatus,
    outcome: value.outcome,
    durationMs: value.durationMs,
    retry: value.retry,
    errorCount: value.errorCount,
  };
}

export function parseLocalBusinessesResultIpcMessage(
  value: unknown,
  expectedSlotId?: string,
): LocalBusinessesResultIpcMessage {
  const invalid = (): never => {
    throw new Error('Invalid local Businesses result IPC message.');
  };

  if (
    !isObject(value) ||
    value.type !== 'businesses-local-result' ||
    value.version !== 1 ||
    typeof value.slotId !== 'string' ||
    !SLOT_ID_PATTERN.test(value.slotId) ||
    (expectedSlotId !== undefined && value.slotId !== expectedSlotId) ||
    !isLocalSlotResultTotals(value.totals)
  ) {
    return invalid();
  }

  const slotId = value.slotId;
  const totals = sanitizedTotals(value.totals as LocalSlotResultTotals);
  if (value.event === 'begin') {
    if (
      value.status !== 'running' ||
      totals.completed !== 0 ||
      totals.attempts !== 0
    ) {
      return invalid();
    }
    return {
      type: 'businesses-local-result',
      version: 1,
      event: 'begin',
      slotId,
      status: 'running',
      totals,
    };
  }

  if (value.event === 'test-end') {
    if (
      value.status !== 'running' ||
      !isSafeTestResult(value.result) ||
      value.result.testIndex >= totals.discovered ||
      totals.completed === 0 ||
      totals.attempts === 0
    ) {
      return invalid();
    }
    return {
      type: 'businesses-local-result',
      version: 1,
      event: 'test-end',
      slotId,
      status: 'running',
      totals,
      result: sanitizedTestResult(value.result),
    };
  }

  if (value.event === 'end') {
    if (
      !FINAL_RUN_STATUSES.has(value.status as LocalSlotRunStatus) ||
      !isNonNegativeInteger(value.durationMs) ||
      !isNonNegativeInteger(value.globalErrorCount)
    ) {
      return invalid();
    }
    return {
      type: 'businesses-local-result',
      version: 1,
      event: 'end',
      slotId,
      status: value.status as FullResult['status'],
      totals,
      durationMs: value.durationMs,
      globalErrorCount: value.globalErrorCount,
    };
  }

  return invalid();
}

export function parseLocalSlotResultSummary(
  value: unknown,
  expectedSlotId: string,
): LocalSlotResultSummary {
  const invalid = (): never => {
    throw new Error(
      `Invalid local Businesses result summary for ${expectedSlotId}.`,
    );
  };

  if (!SLOT_ID_PATTERN.test(expectedSlotId) || !isObject(value)) {
    return invalid();
  }
  if (
    value.schemaVersion !== SUMMARY_SCHEMA_VERSION ||
    value.slotId !== expectedSlotId ||
    !RUN_STATUSES.has(value.status as LocalSlotRunStatus) ||
    !isIsoDate(value.startedAt) ||
    !isIsoDate(value.updatedAt) ||
    !isNonNegativeInteger(value.globalErrorCount) ||
    !isLocalSlotResultTotals(value.totals) ||
    !Array.isArray(value.activeTests) ||
    !value.activeTests.every(isSafeTestReference) ||
    !Array.isArray(value.results) ||
    !value.results.every(isSafeTestResult)
  ) {
    return invalid();
  }

  const status = value.status as LocalSlotRunStatus;
  const isFinal = FINAL_RUN_STATUSES.has(status);
  const totals = sanitizedTotals(value.totals as LocalSlotResultTotals);
  const activeTests = value.activeTests as SafeTestReference[];
  const results = value.results as SafeTestResult[];
  const calculatedTotals = statusTotals(
    totals.discovered,
    totals.attempts,
    results,
  );
  if (
    (isFinal &&
      (!isIsoDate(value.finishedAt) ||
        !isNonNegativeInteger(value.durationMs) ||
        activeTests.length !== 0)) ||
    (!isFinal &&
      (value.finishedAt !== undefined || value.durationMs !== undefined)) ||
    results.length !== totals.completed ||
    JSON.stringify(calculatedTotals) !== JSON.stringify(totals) ||
    results.some((result) => result.testIndex >= totals.discovered) ||
    activeTests.some((test) => test.testIndex >= totals.discovered) ||
    new Set(results.map((result) => result.testIndex)).size !== results.length ||
    new Set(activeTests.map((test) => test.testIndex)).size !== activeTests.length
  ) {
    return invalid();
  }

  return {
    schemaVersion: SUMMARY_SCHEMA_VERSION,
    slotId: expectedSlotId,
    status,
    startedAt: value.startedAt as string,
    updatedAt: value.updatedAt as string,
    ...(isFinal
      ? {
          finishedAt: value.finishedAt as string,
          durationMs: value.durationMs as number,
        }
      : {}),
    globalErrorCount: value.globalErrorCount as number,
    totals: { ...totals },
    activeTests: activeTests.map(({ testIndex, file, line, column }) => ({
      testIndex,
      file,
      line,
      column,
    })),
    results: results.map(sanitizedTestResult),
  };
}

export function aggregateLocalSlotResults(
  expectedSlotIds: readonly string[],
  summariesBySlot: Readonly<Record<string, unknown>>,
  options: LocalParallelAggregationOptions = {},
): AggregatedLocalParallelResult {
  if (
    expectedSlotIds.length === 0 ||
    expectedSlotIds.some((slotId) => !SLOT_ID_PATTERN.test(slotId)) ||
    new Set(expectedSlotIds).size !== expectedSlotIds.length
  ) {
    throw new Error(
      'Expected local Businesses slots must be unique slot-00 through slot-09 IDs.',
    );
  }
  if (
    options.staleAfterMs !== undefined &&
    (!Number.isInteger(options.staleAfterMs) || options.staleAfterMs <= 0)
  ) {
    throw new Error(
      'Local Businesses summary staleness must be a positive number of milliseconds.',
    );
  }
  const now = options.now ?? new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error(
      'Local Businesses summary aggregation requires a valid current time.',
    );
  }

  const slots: AggregatedLocalSlotResult[] = expectedSlotIds.map((slotId) => {
    const candidate = summariesBySlot[slotId];
    if (candidate === undefined) {
      return {
        slotId,
        status: 'missing',
        discovered: 0,
        completed: 0,
        active: 0,
      };
    }

    try {
      const summary = parseLocalSlotResultSummary(candidate, slotId);
      const isStalled =
        summary.status === 'running' &&
        options.staleAfterMs !== undefined &&
        now.getTime() - Date.parse(summary.updatedAt) >= options.staleAfterMs;
      return {
        slotId,
        status: isStalled ? 'stalled' : summary.status,
        discovered: summary.totals.discovered,
        completed: summary.totals.completed,
        active: summary.activeTests.length,
      };
    } catch {
      return {
        slotId,
        status: 'invalid',
        discovered: 0,
        completed: 0,
        active: 0,
      };
    }
  });

  const incompleteSlotIds = slots
    .filter((slot) =>
      ['missing', 'invalid', 'running', 'stalled'].includes(slot.status),
    )
    .map((slot) => slot.slotId);
  const stalledSlotIds = slots
    .filter((slot) => slot.status === 'stalled')
    .map((slot) => slot.slotId);
  const failedSlotIds = slots
    .filter((slot) =>
      ['failed', 'timedout', 'interrupted'].includes(slot.status),
    )
    .map((slot) => slot.slotId);
  const complete = incompleteSlotIds.length === 0;

  return {
    complete,
    passed: complete && failedSlotIds.length === 0,
    failedSlotIds,
    incompleteSlotIds,
    stalledSlotIds,
    totals: slots.reduce(
      (totals, slot) => ({
        discovered: totals.discovered + slot.discovered,
        completed: totals.completed + slot.completed,
        active: totals.active + slot.active,
      }),
      { discovered: 0, completed: 0, active: 0 },
    ),
    slots,
  };
}

function statusTotals(
  discovered: number,
  attempts: number,
  results: readonly SafeTestResult[],
): LocalSlotResultTotals {
  const totals: LocalSlotResultTotals = {
    discovered,
    completed: results.length,
    attempts,
    passed: 0,
    failed: 0,
    timedOut: 0,
    skipped: 0,
    interrupted: 0,
  };

  for (const result of results) {
    totals[result.status] += 1;
  }
  return totals;
}

/**
 * A local-only reporter that persists bounded progress without retaining test
 * output, errors, attachments, environment variables, or source-defined titles.
 */
export default class LocalBusinessesResultReporter implements Reporter {
  private readonly slotId: string;
  private readonly configuredOutputFile?: string;
  private readonly now: () => Date;
  private outputFile?: string;
  private rootDirectory = process.cwd();
  private startedAt?: Date;
  private discovered = 0;
  private attempts = 0;
  private globalErrorCount = 0;
  private writeSequence = 0;
  private readonly testIndexes = new Map<TestCase, number>();
  private readonly activeTests = new Map<number, SafeTestReference>();
  private readonly results = new Map<number, SafeTestResult>();

  constructor(options: LocalBusinessesResultReporterOptions = {}) {
    const slotId = options.slotId ?? process.env.BUSINESSES_EXPECTED_SLOT_ID;
    if (!slotId || !SLOT_ID_PATTERN.test(slotId)) {
      throw new Error(
        'The local Businesses result reporter requires slot-00 through slot-09.',
      );
    }
    if (
      options.outputFile !== undefined &&
      (!path.isAbsolute(options.outputFile) || options.outputFile.length === 0)
    ) {
      throw new Error(
        'The local Businesses result reporter output file must be absolute.',
      );
    }

    this.slotId = slotId;
    this.configuredOutputFile = options.outputFile;
    this.now = options.now ?? (() => new Date());
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.rootDirectory = config.rootDir;
    this.outputFile =
      this.configuredOutputFile ??
      path.join(config.projects[0].outputDir, 'slot-result-summary.json');
    this.startedAt = this.now();

    for (const [index, test] of suite.allTests().entries()) {
      this.testIndexes.set(test, index);
    }
    this.discovered = this.testIndexes.size;
    const summary = this.writeSnapshot('running');
    if (summary) {
      this.sendIpc('begin', summary);
    }
  }

  onTestBegin(test: TestCase): void {
    const reference = this.testReference(test);
    this.activeTests.set(reference.testIndex, reference);
    this.writeSnapshot('running');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const reference = this.testReference(test);
    this.attempts += 1;
    this.activeTests.delete(reference.testIndex);
    this.results.set(reference.testIndex, {
      ...reference,
      status: result.status,
      expectedStatus: test.expectedStatus,
      outcome: test.outcome(),
      durationMs: Math.max(0, Math.round(result.duration)),
      retry: Math.max(0, result.retry),
      errorCount: result.errors.length,
    });
    const summary = this.writeSnapshot('running');
    if (summary) {
      this.sendIpc('test-end', summary, this.results.get(reference.testIndex));
    }
  }

  onError(): void {
    this.globalErrorCount += 1;
    if (this.startedAt) {
      this.writeSnapshot('running');
    }
  }

  onEnd(result: FullResult): void {
    this.activeTests.clear();
    const summary = this.writeSnapshot(
      result.status,
      Math.max(0, Math.round(result.duration)),
      this.now(),
    );
    if (summary) {
      this.sendIpc('end', summary);
    }
  }

  private testReference(test: TestCase): SafeTestReference {
    let testIndex = this.testIndexes.get(test);
    if (testIndex === undefined) {
      testIndex = this.testIndexes.size;
      this.testIndexes.set(test, testIndex);
      this.discovered = this.testIndexes.size;
    }

    const relativeFile = path.relative(this.rootDirectory, test.location.file);
    const safeFile =
      relativeFile.length > 0 &&
      !relativeFile.startsWith('..') &&
      !path.isAbsolute(relativeFile)
        ? relativeFile.split(path.sep).join('/')
        : path.basename(test.location.file);

    return {
      testIndex,
      file: safeFile.slice(0, 500),
      line: Math.max(0, test.location.line),
      column: Math.max(0, test.location.column),
    };
  }

  private writeSnapshot(
    status: LocalSlotRunStatus,
    durationMs?: number,
    finishedAt?: Date,
  ): LocalSlotResultSummary | undefined {
    if (!this.outputFile || !this.startedAt) {
      return undefined;
    }

    const now = this.now();
    const results = [...this.results.values()].sort(
      (left, right) => left.testIndex - right.testIndex,
    );
    const summary: LocalSlotResultSummary = {
      schemaVersion: SUMMARY_SCHEMA_VERSION,
      slotId: this.slotId,
      status,
      startedAt: this.startedAt.toISOString(),
      updatedAt: now.toISOString(),
      ...(finishedAt ? { finishedAt: finishedAt.toISOString() } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
      globalErrorCount: this.globalErrorCount,
      totals: statusTotals(this.discovered, this.attempts, results),
      activeTests: [...this.activeTests.values()].sort(
        (left, right) => left.testIndex - right.testIndex,
      ),
      results,
    };

    mkdirSync(path.dirname(this.outputFile), { recursive: true });
    this.writeSequence += 1;
    const temporaryFile = `${this.outputFile}.${process.pid}.${this.writeSequence}.tmp`;
    try {
      writeFileSync(temporaryFile, `${JSON.stringify(summary, null, 2)}\n`, {
        encoding: 'utf8',
        mode: 0o600,
      });
      renameSync(temporaryFile, this.outputFile);
    } catch (error) {
      try {
        unlinkSync(temporaryFile);
      } catch {
        // The temporary file was either renamed or never created.
      }
      throw error;
    }

    return summary;
  }

  private sendIpc(
    event: LocalBusinessesResultIpcMessage['event'],
    summary: LocalSlotResultSummary,
    testResult?: SafeTestResult,
  ): void {
    if (typeof process.send !== 'function' || process.connected === false) {
      return;
    }

    let candidate: unknown;
    if (event === 'begin') {
      candidate = {
        type: 'businesses-local-result',
        version: 1,
        event,
        slotId: summary.slotId,
        status: 'running',
        totals: summary.totals,
      };
    } else if (event === 'test-end' && testResult) {
      candidate = {
        type: 'businesses-local-result',
        version: 1,
        event,
        slotId: summary.slotId,
        status: 'running',
        totals: summary.totals,
        result: testResult,
      };
    } else if (event === 'end' && summary.status !== 'running') {
      candidate = {
        type: 'businesses-local-result',
        version: 1,
        event,
        slotId: summary.slotId,
        status: summary.status,
        totals: summary.totals,
        durationMs: summary.durationMs,
        globalErrorCount: summary.globalErrorCount,
      };
    } else {
      return;
    }

    const safeMessage = parseLocalBusinessesResultIpcMessage(
      candidate,
      this.slotId,
    );
    try {
      process.send(safeMessage);
    } catch {
      // The atomic summary remains authoritative if the parent disconnected.
    }
  }
}
