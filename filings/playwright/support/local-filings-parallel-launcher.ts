import { spawn, type ChildProcess } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import path from 'node:path';

import {
  acquireLocalResultsLease,
  buildLocalPlaywrightArguments,
  parseLocalLauncherArguments,
  prepareLocalPlaywrightEnvironment,
  readLocalFilingsSlotPool,
  resetLocalFilingsResults,
  stripLocalSlotEnvironment,
} from './local-filings-launcher';
import {
  type LocalFilingsResultIpcMessage,
  type LocalSlotResultSummary,
  type LocalSlotResultTotals,
  parseLocalFilingsResultIpcMessage,
  parseLocalSlotResultSummary,
} from './local-filings-result-reporter';

const DEFAULT_MAX_PARALLEL = 4;
const DEFAULT_SLOT_TIMEOUT_MINUTES = 15;
const MAX_SLOT_TIMEOUT_MINUTES = 60;
const CLEANUP_TIMEOUT_MS = 30_000;
const FINAL_REPORT_TIMEOUT_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const FORCE_KILL_GRACE_MS = 5_000;
const PROCESS_TREE_KILL_RETRY_MS = 5_000;
const TASKKILL_TIMEOUT_MS = 10_000;
const REPORT_MERGE_TIMEOUT_MS = 2 * 60_000;
const MAX_SLOT_COUNT = 10;
const SLOT_ID_PATTERN = /^slot-0[0-9]$/;
const ALL_SLOT_IDS = Array.from(
  { length: MAX_SLOT_COUNT },
  (_, index) => `slot-${String(index).padStart(2, '0')}`,
);
const filingsDirectory = path.resolve(__dirname, '..', '..');

export interface ParallelLauncherArguments {
  slotIds: string[];
  maxParallel: number;
  slotTimeoutMinutes: number;
  playwrightArgs: string[];
}

export type ParallelSlotOutcome =
  | 'passed'
  | 'failed'
  | 'spawn-error'
  | 'slot-timeout'
  | 'cleanup-timeout'
  | 'canceled';

export interface ParallelSlotExecutionResult {
  slotId: string;
  outcome: ParallelSlotOutcome;
  exitCode: number;
  durationMs: number;
  totals?: LocalSlotResultTotals;
  summary?: LocalSlotResultSummary;
}

export interface ParallelRunResult {
  completedSlots: string[];
  failedSlots: string[];
  results: ParallelSlotExecutionResult[];
}

export interface LocalParallelRunPaths {
  runId: string;
  rootDirectory: string;
  blobDirectory: string;
  resultDirectory: string;
  mergeInputDirectory: string;
  htmlDirectory: string;
}

export interface LocalParallelReportResult {
  availableSlotIds: string[];
  missingSlotIds: string[];
  mergeExitCode: number;
  htmlDirectory: string;
}

export interface ActiveSlotProgress {
  slotId: string;
  startedAtMs: number;
  phase: 'running-tests' | 'finishing';
  discovered: number;
  completed: number;
}

export type ParallelSlotRunner = (
  slotId: string,
  playwrightArgs: readonly string[],
) => Promise<ParallelSlotExecutionResult>;

interface ActiveSlotControl {
  child: ChildProcess;
  progress: ActiveSlotProgress;
  cancel: (outcome: ParallelSlotOutcome) => void;
}

function createEmptyTotals(): LocalSlotResultTotals {
  return {
    discovered: 0,
    completed: 0,
    attempts: 0,
    passed: 0,
    failed: 0,
    timedOut: 0,
    skipped: 0,
    interrupted: 0,
  };
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function parseParallelLauncherArguments(
  argumentsToParse: readonly string[],
): ParallelLauncherArguments {
  let maxParallel = DEFAULT_MAX_PARALLEL;
  let slotTimeoutMinutes = DEFAULT_SLOT_TIMEOUT_MINUTES;
  let slotIds = [...ALL_SLOT_IDS];
  let sawMaxParallel = false;
  let sawSlotTimeout = false;
  let sawSlots = false;
  const playwrightArgs: string[] = [];

  for (const argument of argumentsToParse) {
    if (argument === '--max-parallel') {
      throw new Error('--max-parallel requires an equals sign and a value from 1 through 10.');
    }

    if (argument.startsWith('--max-parallel=')) {
      if (sawMaxParallel) {
        throw new Error('The parallel launcher accepts --max-parallel only once.');
      }

      const rawValue = argument.slice('--max-parallel='.length);
      if (!/^(?:[1-9]|10)$/.test(rawValue)) {
        throw new Error('--max-parallel must be a whole number from 1 through 10.');
      }

      maxParallel = Number(rawValue);
      sawMaxParallel = true;
      continue;
    }

    if (argument === '--slot-timeout-minutes') {
      throw new Error(
        '--slot-timeout-minutes requires an equals sign and a whole-number value.',
      );
    }

    if (argument.startsWith('--slot-timeout-minutes=')) {
      if (sawSlotTimeout) {
        throw new Error(
          'The parallel launcher accepts --slot-timeout-minutes only once.',
        );
      }

      const rawValue = argument.slice('--slot-timeout-minutes='.length);
      if (!/^\d+$/.test(rawValue)) {
        throw new Error(
          `--slot-timeout-minutes must be a whole number from 1 through ${MAX_SLOT_TIMEOUT_MINUTES}.`,
        );
      }
      const parsedValue = Number(rawValue);
      if (parsedValue < 1 || parsedValue > MAX_SLOT_TIMEOUT_MINUTES) {
        throw new Error(
          `--slot-timeout-minutes must be a whole number from 1 through ${MAX_SLOT_TIMEOUT_MINUTES}.`,
        );
      }

      slotTimeoutMinutes = parsedValue;
      sawSlotTimeout = true;
      continue;
    }

    if (argument === '--slots') {
      throw new Error('--slots requires an equals sign and a comma-separated slot list.');
    }

    if (argument.startsWith('--slots=')) {
      if (sawSlots) {
        throw new Error('The parallel launcher accepts --slots only once.');
      }

      const requestedSlots = argument.slice('--slots='.length).split(',');
      if (
        requestedSlots.length === 0 ||
        requestedSlots.some((slotId) => !SLOT_ID_PATTERN.test(slotId))
      ) {
        throw new Error(
          '--slots must be a comma-separated list using slot-00 through slot-09.',
        );
      }
      if (new Set(requestedSlots).size !== requestedSlots.length) {
        throw new Error('--slots must not contain duplicate slot IDs.');
      }

      slotIds = requestedSlots;
      sawSlots = true;
      continue;
    }

    if (argument === '--slot' || argument.startsWith('--slot=')) {
      throw new Error(
        'Use --slots=slot-NN,... with the parallel launcher; --slot belongs to the single-slot launcher.',
      );
    }

    playwrightArgs.push(argument);
  }

  // Reuse the single-slot safety policy before any process is started.
  parseLocalLauncherArguments([`--slot=${slotIds[0]}`, ...playwrightArgs]);

  return { slotIds, maxParallel, slotTimeoutMinutes, playwrightArgs };
}

export function buildParallelPlaywrightArguments(
  slotId: string,
  playwrightArgs: readonly string[],
  outputDirectory: string,
): string[] {
  if (!SLOT_ID_PATTERN.test(slotId)) {
    throw new Error('Parallel child slot must be one of slot-00 through slot-09.');
  }
  if (!path.isAbsolute(outputDirectory)) {
    throw new Error('Parallel child output directory must be absolute.');
  }
  return buildLocalPlaywrightArguments(playwrightArgs, outputDirectory);
}

export function createLocalParallelRunPaths(
  now: Date = new Date(),
  processId: number = process.pid,
): LocalParallelRunPaths {
  if (Number.isNaN(now.getTime()) || !Number.isInteger(processId) || processId < 1) {
    throw new Error('Unable to create a valid local Filings report run ID.');
  }

  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const runId = `${timestamp}-${processId}`;
  const rootDirectory = path.join(
    filingsDirectory,
    'test-results',
    'local',
    'reports',
    runId,
  );

  return {
    runId,
    rootDirectory,
    blobDirectory: path.join(rootDirectory, 'blobs'),
    resultDirectory: path.join(rootDirectory, 'results'),
    mergeInputDirectory: path.join(rootDirectory, 'merge-input'),
    htmlDirectory: path.join(rootDirectory, 'html'),
  };
}

function createPrivateDirectory(directory: string): void {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  try {
    chmodSync(directory, 0o700);
  } catch {
    // Windows does not implement POSIX modes; its local ACL remains authoritative.
  }
}

function restrictReportTree(target: string): void {
  if (!existsSync(target)) {
    return;
  }
  const metadata = lstatSync(target);
  if (metadata.isSymbolicLink()) {
    return;
  }
  if (metadata.isDirectory()) {
    try {
      chmodSync(target, 0o700);
    } catch {
      // Best effort on filesystems without POSIX mode support.
    }
    for (const childName of readdirSync(target)) {
      restrictReportTree(path.join(target, childName));
    }
    return;
  }
  try {
    chmodSync(target, 0o600);
  } catch {
    // Best effort on filesystems without POSIX mode support.
  }
}

function stripParallelReporterEnvironment(environment: NodeJS.ProcessEnv): void {
  const exactNames = new Set([
    'FILINGS_LOCAL_PARALLEL',
    'FILINGS_LOCAL_RESULT_FILE',
    'PLAYWRIGHT_BLOB_OUTPUT_FILE',
    'PLAYWRIGHT_BLOB_OUTPUT_DIR',
    'PLAYWRIGHT_BLOB_OUTPUT_NAME',
    'PWTEST_BLOB_DO_NOT_REMOVE',
    'PW_TEST_REPORTER',
  ]);

  for (const environmentName of Object.keys(environment)) {
    const normalizedName = environmentName.toUpperCase();
    if (
      exactNames.has(normalizedName) ||
      normalizedName.startsWith('PLAYWRIGHT_HTML_')
    ) {
      delete environment[environmentName];
    }
  }
}

export function prepareParallelSlotEnvironment(
  sourceEnvironment: NodeJS.ProcessEnv,
  slotId: string,
  localSlotPool: Readonly<Record<string, string>>,
  runPaths: LocalParallelRunPaths,
): NodeJS.ProcessEnv {
  const childEnvironment = prepareLocalPlaywrightEnvironment(
    sourceEnvironment,
    slotId,
    localSlotPool,
  );
  stripParallelReporterEnvironment(childEnvironment);

  const slotBlobDirectory = path.join(runPaths.blobDirectory, slotId);
  const resultFile = path.join(runPaths.resultDirectory, `${slotId}.json`);
  childEnvironment.FILINGS_LOCAL_PARALLEL = 'true';
  childEnvironment.FILINGS_LOCAL_RESULT_FILE = resultFile;
  childEnvironment.PLAYWRIGHT_BLOB_OUTPUT_DIR = slotBlobDirectory;
  childEnvironment.PLAYWRIGHT_BLOB_OUTPUT_NAME = 'report.zip';
  return childEnvironment;
}

export async function executeParallelSlots(
  options: ParallelLauncherArguments,
  runSlot: ParallelSlotRunner,
): Promise<ParallelRunResult> {
  let nextSlotIndex = 0;
  const results: ParallelSlotExecutionResult[] = [];
  const runnerCount = Math.min(options.maxParallel, options.slotIds.length);

  async function runNextSlots(): Promise<void> {
    while (nextSlotIndex < options.slotIds.length) {
      const slotId = options.slotIds[nextSlotIndex];
      nextSlotIndex += 1;

      let result: ParallelSlotExecutionResult;
      try {
        result = await runSlot(slotId, options.playwrightArgs);
      } catch {
        result = {
          slotId,
          outcome: 'spawn-error',
          exitCode: 1,
          durationMs: 0,
        };
      }
      results.push(result);
    }
  }

  await Promise.all(
    Array.from({ length: runnerCount }, () => runNextSlots()),
  );

  const resultBySlotId = new Map(results.map((result) => [result.slotId, result]));
  const orderedResults = options.slotIds.map(
    (slotId) =>
      resultBySlotId.get(slotId) ?? {
        slotId,
        outcome: 'spawn-error' as const,
        exitCode: 1,
        durationMs: 0,
      },
  );
  return {
    completedSlots: orderedResults.map((result) => result.slotId),
    failedSlots: orderedResults
      .filter((result) => result.outcome !== 'passed')
      .map((result) => result.slotId),
    results: orderedResults,
  };
}

function readSafeSlotSummary(
  resultFile: string,
  slotId: string,
): LocalSlotResultSummary | undefined {
  try {
    return parseLocalSlotResultSummary(
      JSON.parse(readFileSync(resultFile, 'utf8')),
      slotId,
    );
  } catch {
    return undefined;
  }
}

function waitForChildExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const onExit = (): void => {
      clearTimeout(timeout);
      resolve(true);
    };
    const timeout = setTimeout(() => {
      child.removeListener('exit', onExit);
      resolve(false);
    }, timeoutMs);
    child.once('exit', onExit);
  });
}

async function runTreeKill(pid: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const killer = spawn(
      'taskkill',
      ['/PID', String(pid), '/T', '/F'],
      {
        shell: false,
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    const finish = (succeeded: boolean): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve(succeeded);
    };
    const timeout = setTimeout(() => {
      try {
        killer.kill('SIGKILL');
      } catch {
        // The taskkill helper may have exited while its timeout fired.
      }
      finish(false);
    }, TASKKILL_TIMEOUT_MS);
    killer.once('error', () => finish(false));
    killer.once('exit', (exitCode) => finish(exitCode === 0));
  });
}

export async function terminateProcessTree(child: ChildProcess): Promise<boolean> {
  const pid = child.pid;
  if (!pid || child.exitCode !== null || child.signalCode !== null) {
    return true;
  }

  if (process.platform === 'win32') {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await runTreeKill(pid);
      if (await waitForChildExit(child, FORCE_KILL_GRACE_MS)) {
        return true;
      }
      try {
        child.kill('SIGKILL');
      } catch {
        // Retry the exact-PID process-tree kill below.
      }
      if (await waitForChildExit(child, FORCE_KILL_GRACE_MS)) {
        return true;
      }
    }
    return child.exitCode !== null || child.signalCode !== null;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      return child.exitCode !== null || child.signalCode !== null;
    }
  }
  if (!(await waitForChildExit(child, FORCE_KILL_GRACE_MS))) {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        child.kill('SIGKILL');
      } catch {
        // The process tree exited between the check and force-kill.
      }
    }
    return waitForChildExit(child, FORCE_KILL_GRACE_MS);
  }
  return true;
}

function outcomeLabel(outcome: ParallelSlotOutcome): string {
  switch (outcome) {
    case 'slot-timeout':
      return 'timed out while tests were running';
    case 'cleanup-timeout':
      return 'timed out while Playwright was shutting down';
    case 'spawn-error':
      return 'could not start';
    case 'canceled':
      return 'canceled';
    default:
      return outcome;
  }
}

function safeIpcMessage(
  value: unknown,
  slotId: string,
): LocalFilingsResultIpcMessage | undefined {
  try {
    return parseLocalFilingsResultIpcMessage(value, slotId);
  } catch {
    return undefined;
  }
}

function spawnSlot(
  slotId: string,
  playwrightArgs: readonly string[],
  slotTimeoutMinutes: number,
  runPaths: LocalParallelRunPaths,
  activeSlots: Map<string, ActiveSlotControl>,
): Promise<ParallelSlotExecutionResult> {
  process.stdout.write(`[${slotId}] Starting local Filings tests.\n`);
  const startedAtMs = Date.now();

  const childEnvironment = prepareParallelSlotEnvironment(
    process.env,
    slotId,
    readLocalFilingsSlotPool(),
    runPaths,
  );
  const resultFile = childEnvironment.FILINGS_LOCAL_RESULT_FILE as string;
  createPrivateDirectory(path.dirname(resultFile));
  createPrivateDirectory(
    childEnvironment.PLAYWRIGHT_BLOB_OUTPUT_DIR as string,
  );

  return new Promise((resolve) => {
    let settled = false;
    let requestedOutcome: ParallelSlotOutcome | undefined;
    let finalReporterStatus: LocalSlotResultSummary['status'] | undefined;
    let lastTotals: LocalSlotResultTotals | undefined;
    let cleanupTimeout: NodeJS.Timeout | undefined;
    let finalReportTimeout: NodeJS.Timeout | undefined;
    let summaryPoller: NodeJS.Timeout | undefined;
    let terminationRetry: NodeJS.Timeout | undefined;
    let terminationInFlight = false;
    const progress: ActiveSlotProgress = {
      slotId,
      startedAtMs,
      phase: 'running-tests',
      discovered: 0,
      completed: 0,
    };
    const child = spawn(
      process.execPath,
      buildParallelPlaywrightArguments(
        slotId,
        playwrightArgs,
        path.join(runPaths.rootDirectory, 'outputs', slotId),
      ),
      {
        cwd: filingsDirectory,
        env: childEnvironment,
        shell: false,
        detached: process.platform !== 'win32',
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      },
    );

    const clearTimers = (): void => {
      clearTimeout(slotTimeout);
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
      if (finalReportTimeout) {
        clearTimeout(finalReportTimeout);
      }
      if (summaryPoller) {
        clearInterval(summaryPoller);
      }
      if (terminationRetry) {
        clearTimeout(terminationRetry);
      }
    };

    const finish = (
      outcome: ParallelSlotOutcome,
      exitCode: number,
    ): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimers();
      activeSlots.delete(slotId);
      const summary = readSafeSlotSummary(resultFile, slotId);
      const totals = summary?.totals ?? lastTotals;
      const durationMs = Date.now() - startedAtMs;
      process.stdout.write(
        `[${slotId}] ${outcomeLabel(outcome)} after ${formatDuration(durationMs)}` +
          `${totals ? ` (${totals.completed}/${totals.discovered} tests completed)` : ''}.\n`,
      );
      resolve({
        slotId,
        outcome,
        exitCode,
        durationMs,
        ...(totals ? { totals } : {}),
        ...(summary ? { summary } : {}),
      });
    };

    const tryTerminate = (): void => {
      if (settled || terminationInFlight) {
        return;
      }
      terminationInFlight = true;
      void terminateProcessTree(child).then((terminated) => {
        terminationInFlight = false;
        if (!terminated && !settled) {
          process.stderr.write(
            `[${slotId}] Unable to confirm process-tree termination; retrying.\n`,
          );
          terminationRetry = setTimeout(tryTerminate, PROCESS_TREE_KILL_RETRY_MS);
          terminationRetry.unref();
        }
      });
    };

    const requestTermination = (outcome: ParallelSlotOutcome): void => {
      if (settled) {
        return;
      }
      if (!requestedOutcome) {
        requestedOutcome = outcome;
        process.stderr.write(
          `[${slotId}] ${outcomeLabel(outcome)}; terminating its process tree.\n`,
        );
      }
      tryTerminate();
    };

    const startFinalReportWatchdog = (totals: LocalSlotResultTotals): void => {
      if (
        settled ||
        finalReporterStatus !== undefined ||
        finalReportTimeout !== undefined ||
        totals.discovered === 0 ||
        totals.completed !== totals.discovered
      ) {
        return;
      }
      progress.phase = 'finishing';
      finalReportTimeout = setTimeout(
        () => requestTermination('cleanup-timeout'),
        FINAL_REPORT_TIMEOUT_MS,
      );
      finalReportTimeout.unref();
    };

    const markReporterFinished = (
      status: LocalSlotResultSummary['status'],
      totals: LocalSlotResultTotals,
    ): void => {
      if (settled || status === 'running' || finalReporterStatus !== undefined) {
        return;
      }
      finalReporterStatus = status;
      if (finalReportTimeout) {
        clearTimeout(finalReportTimeout);
        finalReportTimeout = undefined;
      }
      lastTotals = totals;
      progress.discovered = totals.discovered;
      progress.completed = totals.completed;
      progress.phase = 'finishing';
      process.stdout.write(
        `[${slotId}] Tests ${status === 'passed' ? 'passed' : 'failed'}; ` +
          'waiting for Playwright shutdown.\n',
      );
      if (child.connected) {
        child.disconnect();
      }
      cleanupTimeout = setTimeout(
        () => requestTermination('cleanup-timeout'),
        CLEANUP_TIMEOUT_MS,
      );
      cleanupTimeout.unref();
    };

    const slotTimeout = setTimeout(
      () =>
        requestTermination(
          progress.phase === 'finishing' ? 'cleanup-timeout' : 'slot-timeout',
        ),
      slotTimeoutMinutes * 60_000,
    );
    slotTimeout.unref();

    activeSlots.set(slotId, {
      child,
      progress,
      cancel: (outcome) => requestTermination(outcome),
    });

    // IPC is preferred for immediate feedback. The atomic file is authoritative
    // and also starts the shutdown watchdog if the IPC message is lost.
    summaryPoller = setInterval(() => {
      const summary = readSafeSlotSummary(resultFile, slotId);
      if (!summary) {
        return;
      }
      lastTotals = summary.totals;
      progress.discovered = summary.totals.discovered;
      progress.completed = summary.totals.completed;
      startFinalReportWatchdog(summary.totals);
      markReporterFinished(summary.status, summary.totals);
    }, 5_000);
    summaryPoller.unref();

    child.on('message', (value: unknown) => {
      const message = safeIpcMessage(value, slotId);
      if (!message || settled) {
        return;
      }

      lastTotals = message.totals;
      progress.discovered = message.totals.discovered;
      progress.completed = message.totals.completed;
      if (message.event === 'begin') {
        process.stdout.write(`[${slotId}] ${message.totals.discovered} tests selected.\n`);
        return;
      }
      if (message.event === 'test-end') {
        const reference = `${message.result.file}:${message.result.line}`;
        process.stdout.write(
          `[${slotId}] ${message.result.status.toUpperCase()} ${reference} ` +
            `(${formatDuration(message.result.durationMs)}) ` +
            `[${message.totals.completed}/${message.totals.discovered}].\n`,
        );
        startFinalReportWatchdog(message.totals);
        return;
      }

      markReporterFinished(message.status, message.totals);
    });

    child.once('error', () => {
      finish('spawn-error', 1);
    });
    child.once('exit', (exitCode, signal) => {
      if (settled) {
        return;
      }
      const finalSummary = readSafeSlotSummary(resultFile, slotId);
      const outcome =
        requestedOutcome ??
        (signal !== null || exitCode !== 0 || finalSummary?.status !== 'passed'
          ? 'failed'
          : 'passed');
      finish(outcome, outcome === 'passed' ? 0 : (exitCode ?? 1));
    });
  });
}

export function formatParallelHeartbeat(
  totalSlots: number,
  completedSlots: number,
  activeProgress: readonly ActiveSlotProgress[],
  nowMs: number = Date.now(),
): string {
  const queuedSlots = Math.max(0, totalSlots - completedSlots - activeProgress.length);
  const active = activeProgress.length
    ? activeProgress
        .map(
          (progress) =>
            `${progress.slotId} ${progress.completed}/${progress.discovered || '?'} ` +
            `${progress.phase === 'finishing' ? 'finishing' : 'running'} ` +
            `${formatDuration(nowMs - progress.startedAtMs)}`,
        )
        .join(', ')
    : 'none';
  return (
    `Local Filings progress: ${completedSlots}/${totalSlots} slots complete; ` +
    `${queuedSlots} queued; active: ${active}.`
  );
}

async function runProcess(
  command: string,
  argumentsToRun: readonly string[],
  environment: NodeJS.ProcessEnv,
  timeoutMs: number,
  onSpawn?: (child: ChildProcess) => void,
): Promise<number> {
  return new Promise((resolve) => {
    let settled = false;
    let timedOut = false;
    let terminationRetry: NodeJS.Timeout | undefined;
    const child = spawn(command, argumentsToRun, {
      cwd: filingsDirectory,
      env: environment,
      shell: false,
      detached: process.platform !== 'win32',
      stdio: 'inherit',
    });
    onSpawn?.(child);
    const finish = (exitCode: number): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (terminationRetry) {
        clearTimeout(terminationRetry);
      }
      resolve(exitCode);
    };
    const terminateForTimeout = (): void => {
      void terminateProcessTree(child).then((terminated) => {
        if (!terminated && !settled) {
          terminationRetry = setTimeout(
            terminateForTimeout,
            PROCESS_TREE_KILL_RETRY_MS,
          );
          terminationRetry.unref();
        }
      });
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      process.stderr.write('Playwright report merge timed out; terminating it.\n');
      terminateForTimeout();
    }, timeoutMs);
    timeout.unref();
    child.once('error', () => finish(1));
    child.once('exit', (exitCode, signal) =>
      finish(
        timedOut || signal !== null ? 1 : (exitCode ?? 1),
      ),
    );
  });
}

export async function mergeLocalParallelReports(
  slotIds: readonly string[],
  runPaths: LocalParallelRunPaths,
  onMergeSpawn?: (child: ChildProcess) => void,
): Promise<LocalParallelReportResult> {
  createPrivateDirectory(runPaths.mergeInputDirectory);
  const availableSlotIds: string[] = [];
  const missingSlotIds: string[] = [];

  for (const slotId of slotIds) {
    const source = path.join(runPaths.blobDirectory, slotId, 'report.zip');
    if (!existsSync(source)) {
      missingSlotIds.push(slotId);
      continue;
    }
    copyFileSync(source, path.join(runPaths.mergeInputDirectory, `${slotId}.zip`));
    restrictReportTree(source);
    restrictReportTree(path.join(runPaths.mergeInputDirectory, `${slotId}.zip`));
    availableSlotIds.push(slotId);
  }

  if (availableSlotIds.length === 0) {
    return {
      availableSlotIds,
      missingSlotIds,
      mergeExitCode: 1,
      htmlDirectory: runPaths.htmlDirectory,
    };
  }

  const mergeEnvironment: NodeJS.ProcessEnv = { ...process.env };
  stripLocalSlotEnvironment(mergeEnvironment);
  stripParallelReporterEnvironment(mergeEnvironment);
  mergeEnvironment.PLAYWRIGHT_HTML_OUTPUT_DIR = runPaths.htmlDirectory;
  mergeEnvironment.PLAYWRIGHT_HTML_OPEN = 'never';
  mergeEnvironment.PLAYWRIGHT_HTML_TITLE =
    `Filings local parallel run ${runPaths.runId}`;
  const playwrightCli = require.resolve('@playwright/test/cli');
  const mergeExitCode = await runProcess(
    process.execPath,
    [
      playwrightCli,
      'merge-reports',
      runPaths.mergeInputDirectory,
      '--reporter=list,html',
    ],
    mergeEnvironment,
    REPORT_MERGE_TIMEOUT_MS,
    onMergeSpawn,
  );
  restrictReportTree(runPaths.rootDirectory);

  return {
    availableSlotIds,
    missingSlotIds,
    mergeExitCode,
    htmlDirectory: runPaths.htmlDirectory,
  };
}

function printFinalSummary(result: ParallelRunResult): void {
  process.stdout.write('\nLocal Filings parallel slot summary:\n');
  for (const slotResult of result.results) {
    const totals = slotResult.totals ?? createEmptyTotals();
    process.stdout.write(
      `  ${slotResult.slotId}: ${outcomeLabel(slotResult.outcome)}; ` +
        `${totals.passed} passed, ${totals.failed} failed, ` +
        `${totals.timedOut} timed out, ${totals.skipped} skipped ` +
        `(${formatDuration(slotResult.durationMs)}).\n`,
    );
  }
}

async function runValidatedParallelFilingsTests(
  options: ParallelLauncherArguments,
  runPaths: LocalParallelRunPaths,
): Promise<number> {
  createPrivateDirectory(runPaths.rootDirectory);
  const activeSlots = new Map<string, ActiveSlotControl>();
  let activeMergeChild: ChildProcess | undefined;
  let interruptionExitCode: number | undefined;
  let completedSlotCount = 0;

  const stopChildren = (exitCode: number): void => {
    if (interruptionExitCode === undefined) {
      interruptionExitCode = exitCode;
    }
    for (const control of activeSlots.values()) {
      control.cancel('canceled');
    }
    if (activeMergeChild) {
      void terminateProcessTree(activeMergeChild);
    }
  };
  const handleSigint = (): void => stopChildren(130);
  const handleSigterm = (): void => stopChildren(143);
  process.on('SIGINT', handleSigint);
  process.on('SIGTERM', handleSigterm);
  const previousUmask = process.umask(0o077);

  process.stdout.write(
    `Starting ${options.slotIds.length} local Filings slots with up to ${Math.min(
      options.maxParallel,
      options.slotIds.length,
    )} concurrent processes. Per-slot timeout: ${options.slotTimeoutMinutes} minutes.\n`,
  );
  process.stdout.write(`Local report run: ${path.relative(filingsDirectory, runPaths.rootDirectory)}\n`);

  const heartbeat = setInterval(() => {
    process.stdout.write(
      `${formatParallelHeartbeat(
        options.slotIds.length,
        completedSlotCount,
        [...activeSlots.values()].map((control) => control.progress),
      )}\n`,
    );
  }, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref();

  try {
    const result = await executeParallelSlots(options, async (slotId, playwrightArgs) => {
      if (interruptionExitCode !== undefined) {
        completedSlotCount += 1;
        return {
          slotId,
          outcome: 'canceled',
          exitCode: interruptionExitCode,
          durationMs: 0,
        };
      }

      let slotResult: ParallelSlotExecutionResult;
      try {
        slotResult = await spawnSlot(
          slotId,
          playwrightArgs,
          options.slotTimeoutMinutes,
          runPaths,
          activeSlots,
        );
      } catch {
        slotResult = {
          slotId,
          outcome: 'spawn-error',
          exitCode: 1,
          durationMs: 0,
        };
      } finally {
        completedSlotCount += 1;
      }
      if (slotResult.outcome !== 'passed') {
        const queued = Math.max(
          0,
          options.slotIds.length - completedSlotCount - activeSlots.size,
        );
        process.stderr.write(
          `[${slotId}] failed; continuing ${activeSlots.size} active and ${queued} queued slots.\n`,
        );
      }
      return slotResult;
    });

    clearInterval(heartbeat);
    printFinalSummary(result);

    if (interruptionExitCode !== undefined) {
      process.stderr.write('Local Filings parallel run was interrupted.\n');
      return interruptionExitCode;
    }

    process.stdout.write('\nMerged Playwright results:\n');
    const reportResult = await mergeLocalParallelReports(
      options.slotIds,
      runPaths,
      (child) => {
        activeMergeChild = child;
        child.once('exit', () => {
          if (activeMergeChild === child) {
            activeMergeChild = undefined;
          }
        });
        if (interruptionExitCode !== undefined) {
          void terminateProcessTree(child);
        }
      },
    );
    if (interruptionExitCode !== undefined) {
      process.stderr.write('Local Filings parallel run was interrupted.\n');
      return interruptionExitCode;
    }
    if (reportResult.missingSlotIds.length > 0) {
      process.stderr.write(
        `Missing Playwright blob reports for: ${reportResult.missingSlotIds.join(', ')}.\n`,
      );
    }
    const htmlReportExists = existsSync(
      path.join(reportResult.htmlDirectory, 'index.html'),
    );
    if (reportResult.mergeExitCode === 0 && htmlReportExists) {
      process.stdout.write(
        `HTML report: ${path.relative(filingsDirectory, reportResult.htmlDirectory)}\n` +
          `Open it with: npx playwright show-report "${path.relative(
            filingsDirectory,
            reportResult.htmlDirectory,
          )}"\n`,
      );
    }

    const failed =
      result.failedSlots.length > 0 ||
      reportResult.missingSlotIds.length > 0 ||
      reportResult.mergeExitCode !== 0 ||
      !htmlReportExists;
    if (failed) {
      process.stderr.write(
        `Local Filings parallel run failed${
          result.failedSlots.length > 0
            ? ` for: ${result.failedSlots.join(', ')}`
            : ''
        }.\n`,
      );
      return 1;
    }

    process.stdout.write('Local Filings parallel run passed.\n');
    return 0;
  } finally {
    clearInterval(heartbeat);
    process.umask(previousUmask);
    process.removeListener('SIGINT', handleSigint);
    process.removeListener('SIGTERM', handleSigterm);
  }
}

export async function runParallelFilingsTests(
  launcherArguments: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const options = parseParallelLauncherArguments(launcherArguments);
  const validationPool = readLocalFilingsSlotPool();
  for (const slotId of options.slotIds) {
    prepareLocalPlaywrightEnvironment(process.env, slotId, validationPool);
  }

  const lease = acquireLocalResultsLease();
  const releaseOnExit = (): void => lease.release();
  process.once('exit', releaseOnExit);
  try {
    resetLocalFilingsResults();
    return await runValidatedParallelFilingsTests(
      options,
      createLocalParallelRunPaths(),
    );
  } finally {
    process.removeListener('exit', releaseOnExit);
    lease.release();
  }
}

if (require.main === module) {
  runParallelFilingsTests()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unknown parallel launcher error.';
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
}
