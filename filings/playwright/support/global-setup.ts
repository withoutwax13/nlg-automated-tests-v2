import type { FullConfig } from '@playwright/test';

import { getResourceSlot } from './resource-pool';

export default async function globalSetup(config: FullConfig): Promise<void> {
  if (config.workers !== 1) {
    throw new Error(
      'Filings matrix jobs require exactly one Playwright worker per selected GitHub Actions secret slot.',
    );
  }

  if (
    process.env.E2E_RUN_GLOBAL_STATE === 'true' &&
    (config.workers !== 1 || (config.shard?.total ?? 1) > 1)
  ) {
    throw new Error(
      'E2E_RUN_GLOBAL_STATE=true requires a one-worker, unsharded run so TC40 cannot race other approvals.',
    );
  }

  // Validate and mask the selected slot during preflight. Keep the environment
  // available because Playwright workers are launched after global setup.
  await getResourceSlot(0);
}
