import { expect, test as base } from '@playwright/test';

import { getResourceSlot } from '../support/resource-pool';
import type { ResourceSlot } from '../support/resource-pool';

interface WorkerFixtures {
  resourceSlot: ResourceSlot;
}

export const test = base.extend<{}, WorkerFixtures>({
  resourceSlot: [
    async ({}, use, workerInfo) => {
      let resourceSlot: ResourceSlot;
      try {
        resourceSlot = await getResourceSlot(workerInfo.parallelIndex);
      } finally {
        // Automatic worker fixtures run before test-scoped browser/page fixtures.
        // Remove the serialized slot immediately after parsing so it is not
        // inherited by a browser or subprocess launched by a test.
        delete process.env.FILINGS_RESOURCE_SLOT_JSON;
      }

      await use(resourceSlot);
    },
    { scope: 'worker', auto: true },
  ],
});

export { expect };
export type {
  AccountType,
  BusinessType,
  Credentials,
  ResourceSlot,
} from '../support/resource-pool';
