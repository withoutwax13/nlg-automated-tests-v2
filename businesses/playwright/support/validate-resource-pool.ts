import { loadResourceSlotFromEnvironment } from './resource-pool';

try {
  const resourceSlot = loadResourceSlotFromEnvironment();
  // JSON encoding prevents a configured identifier from becoming a workflow command.
  console.log(`Businesses resource slot ${JSON.stringify(resourceSlot.id)} is valid.`);
} catch (error: unknown) {
  console.error(
    error instanceof Error
      ? error.message
      : 'Unable to validate the businesses resource slot.',
  );
  process.exitCode = 1;
}
