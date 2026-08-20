import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

import {
  buildParallelPlaywrightArguments,
  createLocalParallelRunPaths,
  executeParallelSlots,
  formatParallelHeartbeat,
  parseParallelLauncherArguments,
  terminateProcessTree,
} from './local-businesses-parallel-launcher';

function expectArgumentError(argumentsToParse: string[], expected: RegExp): void {
  assert.throws(() => parseParallelLauncherArguments(argumentsToParse), expected);
}

async function main(): Promise<void> {
  const defaults = parseParallelLauncherArguments([]);
  assert.equal(defaults.maxParallel, 4);
  assert.equal(defaults.slotTimeoutMinutes, 15);
  assert.deepEqual(
    defaults.slotIds,
    Array.from(
      { length: 10 },
      (_, index) => `slot-${String(index).padStart(2, '0')}`,
    ),
  );
  assert.deepEqual(defaults.playwrightArgs, []);

  const selected = parseParallelLauncherArguments([
    '--max-parallel=2',
    '--slot-timeout-minutes=45',
    '--slots=slot-07,slot-01,slot-09',
    '--grep=TC1',
    '--headed',
  ]);
  assert.deepEqual(selected, {
    maxParallel: 2,
    slotTimeoutMinutes: 45,
    slotIds: ['slot-07', 'slot-01', 'slot-09'],
    playwrightArgs: ['--grep=TC1', '--headed'],
  });

  for (const invalidMaxParallel of [
    '--max-parallel',
    '--max-parallel=',
    '--max-parallel=0',
    '--max-parallel=11',
    '--max-parallel=1.5',
  ]) {
    expectArgumentError([invalidMaxParallel], /max-parallel/);
  }
  expectArgumentError(
    ['--max-parallel=2', '--max-parallel=3'],
    /only once/,
  );

  for (const invalidSlotTimeout of [
    '--slot-timeout-minutes',
    '--slot-timeout-minutes=',
    '--slot-timeout-minutes=0',
    '--slot-timeout-minutes=61',
    '--slot-timeout-minutes=1.5',
  ]) {
    expectArgumentError([invalidSlotTimeout], /slot-timeout-minutes/);
  }
  expectArgumentError(
    ['--slot-timeout-minutes=30', '--slot-timeout-minutes=40'],
    /only once/,
  );

  for (const invalidSlots of [
    '--slots',
    '--slots=',
    '--slots=slot-10',
    '--slots=slot-00,slot-10',
    '--slots=slot-00,slot-00',
  ]) {
    expectArgumentError([invalidSlots], /slots/);
  }
  expectArgumentError(
    ['--slots=slot-00', '--slots=slot-01'],
    /only once/,
  );
  expectArgumentError(['--slot=slot-00'], /single-slot launcher/);
  expectArgumentError(['--workers=2'], /safety policy/);
  expectArgumentError(['--ui'], /safety policy/);

  const isolatedOutputDirectory = createLocalParallelRunPaths(
    new Date('2026-08-20T09:10:11.000Z'),
    123,
  ).rootDirectory;
  const childArguments = buildParallelPlaywrightArguments(
    'slot-03',
    ['--list'],
    path.join(isolatedOutputDirectory, 'outputs', 'slot-03'),
  );
  assert.equal(childArguments.includes('--workers=1'), true);
  assert.equal(
    childArguments.some((argument) =>
      /reports[\\/]20260820T091011Z-123[\\/]outputs[\\/]slot-03$/.test(
        argument.replace(/^--output=/, ''),
      ),
    ),
    true,
  );
  assert.equal(childArguments.at(-1), '--list');
  assert.throws(
    () => buildParallelPlaywrightArguments('slot-10', [], isolatedOutputDirectory),
    /slot-00 through slot-09/,
  );
  assert.throws(
    () => buildParallelPlaywrightArguments('slot-00', [], 'relative-output'),
    /must be absolute/,
  );

  let activeCount = 0;
  let peakActiveCount = 0;
  const startedSlots: string[] = [];
  const scheduled = parseParallelLauncherArguments([
    '--max-parallel=3',
    '--slots=slot-00,slot-01,slot-02,slot-03,slot-04',
    '--list',
  ]);
  const result = await executeParallelSlots(
    scheduled,
    async (slotId, playwrightArgs) => {
      startedSlots.push(slotId);
      assert.deepEqual(playwrightArgs, ['--list']);
      activeCount += 1;
      peakActiveCount = Math.max(peakActiveCount, activeCount);
      await new Promise<void>((resolve) => setImmediate(resolve));
      activeCount -= 1;
      if (slotId === 'slot-01') {
        throw new Error('synthetic runner failure');
      }
      const failed = slotId === 'slot-03';
      return {
        slotId,
        outcome: failed ? 'failed' : 'passed',
        exitCode: failed ? 1 : 0,
        durationMs: 5,
      };
    },
  );

  assert.equal(peakActiveCount, 3);
  assert.deepEqual(startedSlots, scheduled.slotIds);
  assert.deepEqual(new Set(result.completedSlots), new Set(scheduled.slotIds));
  assert.deepEqual(new Set(result.failedSlots), new Set(['slot-01', 'slot-03']));
  assert.equal(
    result.results.find((slotResult) => slotResult.slotId === 'slot-01')?.outcome,
    'spawn-error',
  );

  const heartbeat = formatParallelHeartbeat(
    10,
    3,
    [
      {
        slotId: 'slot-03',
        startedAtMs: 1_000,
        phase: 'running-tests',
        discovered: 5,
        completed: 2,
      },
      {
        slotId: 'slot-04',
        startedAtMs: 31_000,
        phase: 'finishing',
        discovered: 4,
        completed: 4,
      },
    ],
    61_000,
  );
  assert.match(heartbeat, /3\/10 slots complete/);
  assert.match(heartbeat, /5 queued/);
  assert.match(heartbeat, /slot-03 2\/5 running 1m 0s/);
  assert.match(heartbeat, /slot-04 4\/4 finishing 30s/);

  const runPaths = createLocalParallelRunPaths(
    new Date('2026-08-20T09:10:11.000Z'),
    123,
  );
  assert.equal(runPaths.runId, '20260820T091011Z-123');
  assert.match(
    runPaths.htmlDirectory,
    /test-results[\\/]local[\\/]reports[\\/]20260820T091011Z-123[\\/]html$/,
  );

  const syntheticProcessTree = spawn(
    process.execPath,
    [
      '-e',
      "const {spawn}=require('node:child_process');" +
        "const child=spawn(process.execPath,['-e','setInterval(() => {}, 1000)'],{stdio:'ignore'});" +
        "child.once('spawn',()=>process.send(child.pid));" +
        'setInterval(() => {}, 1000);',
    ],
    {
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    },
  );
  await once(syntheticProcessTree, 'spawn');
  const [grandchildPidValue] = await once(syntheticProcessTree, 'message');
  const grandchildPid = Number(grandchildPidValue);
  assert.equal(Number.isInteger(grandchildPid) && grandchildPid > 0, true);
  assert.equal(await terminateProcessTree(syntheticProcessTree), true);
  if (
    syntheticProcessTree.exitCode === null &&
    syntheticProcessTree.signalCode === null
  ) {
    await once(syntheticProcessTree, 'exit');
  }
  let grandchildExited = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      process.kill(grandchildPid, 0);
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch {
      grandchildExited = true;
      break;
    }
  }
  if (!grandchildExited) {
    try {
      process.kill(grandchildPid, 'SIGKILL');
    } catch {
      // The final check and cleanup raced with normal process-tree termination.
    }
  }
  assert.equal(grandchildExited, true, 'process-tree termination must include descendants');

  process.stdout.write('Businesses local parallel launcher tests passed.\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
