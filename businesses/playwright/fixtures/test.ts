import { expect, test as base } from '@playwright/test';

import { getResourceSlot, RESOURCE_SLOT_ENV } from '../support/resource-pool';
import type { ResourceSlot } from '../support/resource-pool';
import { guardResourceSlotAccess } from '../support/resource-slot-tag-guard';

interface TestFixtures {
  resourceSlot: ResourceSlot;
}

interface WorkerFixtures {
  selectedResourceSlot: ResourceSlot;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  selectedResourceSlot: [
    async ({}, use, workerInfo) => {
      let resourceSlot: ResourceSlot;
      try {
        resourceSlot = await getResourceSlot(workerInfo.parallelIndex);
      } finally {
        // This automatic worker fixture resolves before the browser and page
        // fixtures. Do not let the serialized secret reach browser subprocesses.
        delete process.env[RESOURCE_SLOT_ENV];
      }

      await use(resourceSlot);
    },
    { scope: 'worker', auto: true },
  ],

  resourceSlot: async ({ selectedResourceSlot }, use, testInfo) => {
    const isIsolatedGlobalStateTest =
      process.env.E2E_RUN_GLOBAL_STATE === 'true' &&
      /[\\/]AGS[\\/]TC32\.spec\.ts$/.test(testInfo.file);

    if (
      !isIsolatedGlobalStateTest &&
      !testInfo.tags.includes(`@${selectedResourceSlot.id}`)
    ) {
      throw new Error(
        `This test must run with the resource secret selected by its @${selectedResourceSlot.id} tag.`,
      );
    }

    await use(
      guardResourceSlotAccess(selectedResourceSlot, testInfo.tags, {
        // TC32 is selected alone, uses one worker, and is intentionally untagged.
        allowUntaggedAccess: isIsolatedGlobalStateTest,
      }),
    );
  },
});

export { expect };
export type {
  AccountType,
  BusinessType,
  Credentials,
  ResourceSlot,
} from '../support/resource-pool';
