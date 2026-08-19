import assert from 'node:assert/strict';

import { parseResourceSlot, type ResourceSlotPayload } from './resource-pool';

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
assert.equal(validSlot.businesses.zeroPayment, 'ZERO PAYMENT BUSINESS 00');

const missingField: Record<string, unknown> = { ...createPayload() };
delete missingField.AGS_PASSWORD;
expectParseError(missingField, 'slot-00', /required field AGS_PASSWORD is missing/);

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
expectParseError(
  { ...createPayload(), AGS_USERNAME: ' TAXPAYER-00@EXAMPLE.INVALID ' },
  'slot-00',
  /usernames must be unique/,
);
expectParseError(
  { ...createPayload(), DRAFT_BUSINESS: ' default business 00 ' },
  'slot-00',
  /businesses must be unique/,
);

assert.throws(
  () => parseResourceSlot('{not-json', 'slot-00'),
  /must contain valid JSON/,
);
assert.throws(
  () => parseResourceSlot('x'.repeat(48 * 1024 + 1), 'slot-00'),
  /exceeds GitHub's 48 KiB secret value limit/,
);

console.log('Filings resource slot tests passed.');
