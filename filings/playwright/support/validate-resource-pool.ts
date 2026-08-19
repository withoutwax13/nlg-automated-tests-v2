import { loadResourceSlotFromEnvironment } from './resource-pool';

function validateResourcePool(): void {
  const slot = loadResourceSlotFromEnvironment();

  // JSON encoding prevents a configured identifier from creating a workflow
  // command or an extra log line. Credential and business values are never logged.
  console.log(`Filings resource slot ${JSON.stringify(slot.id)} is valid.`);
}

try {
  validateResourcePool();
} catch (error: unknown) {
  console.error(
    error instanceof Error
      ? error.message
      : 'Unable to validate the filings resource slot.',
  );
  process.exitCode = 1;
}
