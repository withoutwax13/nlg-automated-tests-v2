import type { FullConfig } from '@playwright/test';

import { getResourceSlot } from './resource-pool';

export default async function globalSetup(config: FullConfig): Promise<void> {
  if (config.workers !== 1) {
    throw new Error(
      'Businesses matrix jobs require exactly one Playwright worker per selected GitHub Actions secret slot.',
    );
  }

  if ((config.shard?.total ?? 1) > 1) {
    throw new Error(
      'Businesses selected-slot runs must be unsharded so one GitHub secret cannot be used concurrently by multiple Playwright shards.',
    );
  }

  if (
    process.env.E2E_RUN_GLOBAL_STATE === 'true' &&
    (config.workers !== 1 || (config.shard?.total ?? 1) > 1)
  ) {
    throw new Error(
      'E2E_RUN_GLOBAL_STATE=true requires a one-worker, unsharded run so TC32 cannot reset municipality data concurrently.',
    );
  }

  // Validate and mask in preflight. The worker fixture must still receive the
  // environment, and removes the serialized value before launching a browser.
  await getResourceSlot(0);
}
