import assert from 'node:assert/strict';

import { createBusinessTestIdentity } from './business-test-identity';
import { parseResourceSlot, type ResourceSlotPayload } from './resource-pool';
import { guardResourceSlotAccess } from './resource-slot-tag-guard';

function createPayload(): ResourceSlotPayload {
  return {
    VERSION: 1,
    SLOT_ID: 'slot-00',
    TAXPAYER_USERNAME: 'taxpayer-00@example.invalid',
    TAXPAYER_PASSWORD: 'taxpayer-password-00',
    MUNICIPAL_USERNAME: 'municipal-00@example.invalid',
    MUNICIPAL_PASSWORD: 'municipal-password-00',
    AGS_USERNAME: 'ags-00@example.invalid',
    AGS_PASSWORD: 'ags-password-00',
    MUNICIPALITY: 'Test Municipality 00',
    RESET_MUNICIPALITY: 'Reset Municipality 00',
    ACTIVE_BUSINESS: 'ACTIVE BUSINESS 00',
    INACTIVE_BUSINESS: 'INACTIVE BUSINESS 00',
    REQUIRED_FORMS_BUSINESS: 'REQUIRED FORMS BUSINESS 00',
    DELINQUENCY_BUSINESS: 'DELINQUENCY BUSINESS 00',
    FILINGS_BUSINESS: 'FILINGS BUSINESS 00',
    DEFAULT_BUSINESS: 'DEFAULT BUSINESS 00',
    FUNDED_BUSINESS: 'FUNDED BUSINESS 00',
    DRAFT_BUSINESS: 'DRAFT BUSINESS 00',
    ZERO_PAYMENT_BUSINESS: 'ZERO PAYMENT BUSINESS 00',
  };
}

function expectParseError(
  value: unknown,
  expectedSlotId: string,
  message: RegExp,
): void {
  assert.throws(
    () => parseResourceSlot(JSON.stringify(value), expectedSlotId),
    message,
  );
}

const validSlot = parseResourceSlot(JSON.stringify(createPayload()), 'slot-00');
assert.equal(validSlot.id, 'slot-00');
assert.equal(validSlot.accounts.taxpayer.username, 'taxpayer-00@example.invalid');
assert.equal(validSlot.businesses.requiredForms, 'REQUIRED FORMS BUSINESS 00');
assert.equal(validSlot.businesses.default, 'DEFAULT BUSINESS 00');
assert.equal(validSlot.businesses.funded, 'FUNDED BUSINESS 00');
assert.equal(validSlot.businesses.draft, 'DRAFT BUSINESS 00');
assert.equal(validSlot.businesses.zeroPayment, 'ZERO PAYMENT BUSINESS 00');
assert.equal(validSlot.resetMunicipality, 'Reset Municipality 00');

const aliasedPayload = {
  ...createPayload(),
  DEFAULT_BUSINESS: 'ACTIVE BUSINESS 00',
  FUNDED_BUSINESS: 'ACTIVE BUSINESS 00',
  DRAFT_BUSINESS: 'ACTIVE BUSINESS 00',
  ZERO_PAYMENT_BUSINESS: 'ACTIVE BUSINESS 00',
};
const aliasedSlot = parseResourceSlot(JSON.stringify(aliasedPayload), 'slot-00');
assert.equal(aliasedSlot.businesses.default, aliasedSlot.businesses.active);
assert.equal(aliasedSlot.businesses.funded, aliasedSlot.businesses.default);
assert.equal(aliasedSlot.businesses.draft, aliasedSlot.businesses.default);
assert.equal(aliasedSlot.businesses.zeroPayment, aliasedSlot.businesses.default);

const missingField: Record<string, unknown> = { ...createPayload() };
delete missingField.AGS_PASSWORD;
expectParseError(missingField, 'slot-00', /required field AGS_PASSWORD is missing/);

const missingCompatibilityBusiness: Record<string, unknown> = {
  ...createPayload(),
};
delete missingCompatibilityBusiness.DEFAULT_BUSINESS;
expectParseError(
  missingCompatibilityBusiness,
  'slot-00',
  /required field DEFAULT_BUSINESS is missing/,
);

expectParseError(
  { ...createPayload(), EXTRA_FIELD: 'unexpected' },
  'slot-00',
  /unknown fields are not allowed/,
);
expectParseError(
  { ...createPayload(), VERSION: 2 },
  'slot-00',
  /VERSION must be 1/,
);
expectParseError(createPayload(), 'slot-01', /SLOT_ID does not match/);
assert.throws(
  () => parseResourceSlot(JSON.stringify(createPayload()), 'slot-10'),
  /must be one of slot-00 through slot-09/,
);
expectParseError(
  { ...createPayload(), AGS_USERNAME: ' TAXPAYER-00@EXAMPLE.INVALID ' },
  'slot-00',
  /usernames must be unique/,
);
expectParseError(
  { ...createPayload(), FILINGS_BUSINESS: ' active business 00 ' },
  'slot-00',
  /businesses must be unique/,
);
expectParseError(
  { ...createPayload(), RESET_MUNICIPALITY: ' test municipality 00 ' },
  'slot-00',
  /MUNICIPALITY and RESET_MUNICIPALITY must be different/,
);

assert.throws(
  () => parseResourceSlot('{not-json', 'slot-00'),
  /must contain valid JSON/,
);
assert.throws(
  () => parseResourceSlot('x'.repeat(48 * 1024 + 1), 'slot-00'),
  /exceeds GitHub's 48 KiB secret value limit/,
);

const guardedSlot = guardResourceSlotAccess(validSlot, [
  '@taxpayer',
  '@business-active',
  '@business-default',
]);
assert.equal(guardedSlot.accounts.taxpayer.username, 'taxpayer-00@example.invalid');
assert.equal(guardedSlot.businesses.active, 'ACTIVE BUSINESS 00');
assert.equal(guardedSlot.businesses.default, 'DEFAULT BUSINESS 00');
assert.throws(
  () => guardedSlot.accounts.ags,
  (error: unknown) =>
    error instanceof Error &&
    /ags account without its required @ags tag/.test(error.message) &&
    !error.message.includes('ags-00@example.invalid'),
);
assert.throws(
  () => guardedSlot.businesses.filings,
  (error: unknown) =>
    error instanceof Error &&
    /filings business without its required @business-filings tag/.test(
      error.message,
    ) &&
    !error.message.includes('FILINGS BUSINESS 00'),
);
assert.throws(
  () => guardedSlot.businesses.funded,
  (error: unknown) =>
    error instanceof Error &&
    /funded business without its required @business-funded tag/.test(
      error.message,
    ) &&
    !error.message.includes('FUNDED BUSINESS 00'),
);

const guardedAliasSlot = guardResourceSlotAccess(aliasedSlot, [
  '@business-zero-payment',
]);
assert.equal(guardedAliasSlot.businesses.zeroPayment, 'ACTIVE BUSINESS 00');

const unguardedGlobalSlot = guardResourceSlotAccess(validSlot, [], {
  allowUntaggedAccess: true,
});
assert.equal(unguardedGlobalSlot.accounts.ags.username, 'ags-00@example.invalid');

const identity = createBusinessTestIdentity('slot-00', {
  testId: 'generated-business-test',
  retry: 0,
  repeatEachIndex: 0,
  workerIndex: 0,
});
const retryIdentity = createBusinessTestIdentity('slot-00', {
  testId: 'generated-business-test',
  retry: 1,
  repeatEachIndex: 0,
  workerIndex: 0,
});
assert.match(identity.suffix, /^slot-00-[a-f0-9]{10}$/);
assert.match(identity.fein, /^\d{2}-\d{7}$/);
assert.match(identity.stateTaxId, /^ST-\d{7}$/);
assert.notEqual(identity.suffix, retryIdentity.suffix);

console.log('Businesses resource slot and access guard tests passed.');
