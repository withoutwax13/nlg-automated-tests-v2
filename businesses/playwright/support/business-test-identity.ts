import { createHash } from 'node:crypto';
import type { TestInfo } from '@playwright/test';

export interface BusinessTestIdentity {
  suffix: string;
  fein: string;
  stateTaxId: string;
}

export type IdentityTestInfo = Pick<
  TestInfo,
  'testId' | 'retry' | 'repeatEachIndex' | 'workerIndex'
>;

const localRunId = `local-${process.pid}-${Date.now()}`;

function decimalDigits(buffer: Buffer, length: number): string {
  return Array.from(buffer.subarray(0, length), (value) => value % 10).join('');
}

/**
 * Produces valid-looking, collision-resistant identifiers without persisting
 * local data. A retry intentionally receives a different identity.
 */
export function createBusinessTestIdentity(
  slotId: string,
  testInfo: IdentityTestInfo,
): BusinessTestIdentity {
  const runId = process.env.GITHUB_RUN_ID || process.env.CI_BUILD_ID || localRunId;
  const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '0';
  const input = [
    slotId,
    runId,
    runAttempt,
    process.pid,
    testInfo.workerIndex,
    testInfo.repeatEachIndex,
    testInfo.retry,
    testInfo.testId,
  ].join('|');
  const digest = createHash('sha256').update(input).digest();
  const shortHash = digest.toString('hex').slice(0, 10);
  const safeSlotId = slotId.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');

  let feinDigits = decimalDigits(digest.subarray(10), 9);
  if (feinDigits.startsWith('00')) {
    feinDigits = `10${feinDigits.slice(2)}`;
  }

  const stateTaxDigits = decimalDigits(digest.subarray(19), 7);

  return {
    suffix: `${safeSlotId}-${shortHash}`,
    fein: `${feinDigits.slice(0, 2)}-${feinDigits.slice(2)}`,
    stateTaxId: `ST-${stateTaxDigits}`,
  };
}
