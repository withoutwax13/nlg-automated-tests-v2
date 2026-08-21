export type AccountType = 'taxpayer' | 'municipal' | 'municipality' | 'ags';
type CanonicalAccountType = Exclude<AccountType, 'municipality'>;

export type BusinessType = 'default' | 'funded' | 'draft' | 'zeroPayment';

export interface Credentials {
  username: string;
  password: string;
}

export interface ResourceSlot {
  id: string;
  accounts: Record<CanonicalAccountType, Credentials>;
  businesses: Record<BusinessType, string>;
}

/**
 * Filings accepts the same atomic slot object as Businesses. Filings exposes
 * only the accounts and four filing-specific businesses that its tests use.
 */
export interface ResourceSlotPayload {
  VERSION: 1;
  SLOT_ID: string;
  TAXPAYER_USERNAME: string;
  TAXPAYER_PASSWORD: string;
  MUNICIPAL_USERNAME: string;
  MUNICIPAL_PASSWORD: string;
  AGS_USERNAME: string;
  AGS_PASSWORD: string;
  MUNICIPALITY: string;
  RESET_MUNICIPALITY: string;
  ACTIVE_BUSINESS: string;
  INACTIVE_BUSINESS: string;
  REQUIRED_FORMS_BUSINESS: string;
  DELINQUENCY_BUSINESS: string;
  FILINGS_BUSINESS: string;
  DEFAULT_BUSINESS: string;
  FUNDED_BUSINESS: string;
  DRAFT_BUSINESS: string;
  ZERO_PAYMENT_BUSINESS: string;
}

export const RESOURCE_SLOT_ENV = 'FILINGS_RESOURCE_SLOT_JSON';
export const EXPECTED_SLOT_ID_ENV = 'FILINGS_EXPECTED_SLOT_ID';

const GITHUB_SECRET_LIMIT_BYTES = 48 * 1024;

const MASKED_FIELD_NAMES = [
  'TAXPAYER_USERNAME',
  'TAXPAYER_PASSWORD',
  'MUNICIPAL_USERNAME',
  'MUNICIPAL_PASSWORD',
  'AGS_USERNAME',
  'AGS_PASSWORD',
  'MUNICIPALITY',
  'RESET_MUNICIPALITY',
  'ACTIVE_BUSINESS',
  'INACTIVE_BUSINESS',
  'REQUIRED_FORMS_BUSINESS',
  'DELINQUENCY_BUSINESS',
  'FILINGS_BUSINESS',
  'DEFAULT_BUSINESS',
  'FUNDED_BUSINESS',
  'DRAFT_BUSINESS',
  'ZERO_PAYMENT_BUSINESS',
] as const;

const REQUIRED_FIELD_NAMES = [
  'VERSION',
  'SLOT_ID',
  ...MASKED_FIELD_NAMES,
] as const;

type RequiredFieldName = (typeof REQUIRED_FIELD_NAMES)[number];

const REQUIRED_FIELD_NAME_SET = new Set<string>(REQUIRED_FIELD_NAMES);
const registeredMasks = new Set<string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(
  value: unknown,
  fieldName: RequiredFieldName,
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Invalid filings resource slot: ${fieldName} must be a non-empty string.`,
    );
  }

  return value;
}

function normalizeUniqueValue(value: string): string {
  return value.trim().toLocaleLowerCase('en-US');
}

function requireSelectedSlotUniqueness(payload: ResourceSlotPayload): void {
  const usernames = [
    payload.TAXPAYER_USERNAME,
    payload.MUNICIPAL_USERNAME,
    payload.AGS_USERNAME,
  ].map(normalizeUniqueValue);

  if (new Set(usernames).size !== usernames.length) {
    throw new Error(
      'Invalid filings resource slot: taxpayer, municipal, and AGS usernames must be unique.',
    );
  }

  // These five Businesses resources represent different seeded states and
  // must stay distinct. The four filing businesses are compatibility aliases
  // and may intentionally reuse any configured business value.
  const businesses = [
    payload.ACTIVE_BUSINESS,
    payload.INACTIVE_BUSINESS,
    payload.REQUIRED_FORMS_BUSINESS,
    payload.DELINQUENCY_BUSINESS,
    payload.FILINGS_BUSINESS,
  ].map(normalizeUniqueValue);

  if (new Set(businesses).size !== businesses.length) {
    throw new Error(
      'Invalid filings resource slot: active, inactive, required-forms, delinquency, and filings businesses must be unique.',
    );
  }

  if (
    normalizeUniqueValue(payload.MUNICIPALITY) ===
    normalizeUniqueValue(payload.RESET_MUNICIPALITY)
  ) {
    throw new Error(
      'Invalid filings resource slot: MUNICIPALITY and RESET_MUNICIPALITY must be different.',
    );
  }
}

function escapeWorkflowCommandMessage(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function registerMask(value: string): void {
  if (process.env.GITHUB_ACTIONS !== 'true' || registeredMasks.has(value)) {
    return;
  }

  registeredMasks.add(value);
  process.stdout.write(`::add-mask::${escapeWorkflowCommandMessage(value)}\n`);
}

function registerKnownMasks(value: Record<string, unknown>): void {
  for (const fieldName of MASKED_FIELD_NAMES) {
    const fieldValue = value[fieldName];
    if (typeof fieldValue === 'string' && fieldValue.length > 0) {
      registerMask(fieldValue);
    }
  }
}

/**
 * Parses the single resource slot selected for a matrix or local child run.
 * Validation errors identify schema locations without echoing configured data.
 */
export function parseResourceSlot(
  rawJson: string,
  expectedSlotId: string,
): ResourceSlot {
  if (typeof rawJson !== 'string' || rawJson.trim().length === 0) {
    throw new Error(`${RESOURCE_SLOT_ENV} must contain the selected slot JSON.`);
  }
  if (Buffer.byteLength(rawJson, 'utf8') > GITHUB_SECRET_LIMIT_BYTES) {
    throw new Error(
      `${RESOURCE_SLOT_ENV} exceeds GitHub's 48 KiB secret value limit.`,
    );
  }
  if (typeof expectedSlotId !== 'string' || expectedSlotId.trim().length === 0) {
    throw new Error(`${EXPECTED_SLOT_ID_ENV} must be a non-empty string.`);
  }
  if (!/^slot-0[0-9]$/.test(expectedSlotId)) {
    throw new Error(
      `${EXPECTED_SLOT_ID_ENV} must be one of slot-00 through slot-09.`,
    );
  }

  // Mask the complete structured secret before parsing can fail, then mask
  // every usable leaf as defense in depth for later workflow output.
  registerMask(rawJson);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    throw new Error(`${RESOURCE_SLOT_ENV} must contain valid JSON.`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`${RESOURCE_SLOT_ENV} must contain a flat JSON object.`);
  }

  registerKnownMasks(parsed);

  for (const fieldName of REQUIRED_FIELD_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(parsed, fieldName)) {
      throw new Error(
        `Invalid filings resource slot: required field ${fieldName} is missing.`,
      );
    }
  }

  const parsedFieldNames = Object.keys(parsed);
  if (
    parsedFieldNames.length !== REQUIRED_FIELD_NAMES.length ||
    parsedFieldNames.some((fieldName) => !REQUIRED_FIELD_NAME_SET.has(fieldName))
  ) {
    throw new Error(
      'Invalid filings resource slot: unknown fields are not allowed.',
    );
  }

  if (parsed.VERSION !== 1) {
    throw new Error('Invalid filings resource slot: VERSION must be 1.');
  }

  const payload = {
    VERSION: 1,
    SLOT_ID: requireNonEmptyString(parsed.SLOT_ID, 'SLOT_ID'),
    TAXPAYER_USERNAME: requireNonEmptyString(
      parsed.TAXPAYER_USERNAME,
      'TAXPAYER_USERNAME',
    ),
    TAXPAYER_PASSWORD: requireNonEmptyString(
      parsed.TAXPAYER_PASSWORD,
      'TAXPAYER_PASSWORD',
    ),
    MUNICIPAL_USERNAME: requireNonEmptyString(
      parsed.MUNICIPAL_USERNAME,
      'MUNICIPAL_USERNAME',
    ),
    MUNICIPAL_PASSWORD: requireNonEmptyString(
      parsed.MUNICIPAL_PASSWORD,
      'MUNICIPAL_PASSWORD',
    ),
    AGS_USERNAME: requireNonEmptyString(parsed.AGS_USERNAME, 'AGS_USERNAME'),
    AGS_PASSWORD: requireNonEmptyString(parsed.AGS_PASSWORD, 'AGS_PASSWORD'),
    MUNICIPALITY: requireNonEmptyString(parsed.MUNICIPALITY, 'MUNICIPALITY'),
    RESET_MUNICIPALITY: requireNonEmptyString(
      parsed.RESET_MUNICIPALITY,
      'RESET_MUNICIPALITY',
    ),
    ACTIVE_BUSINESS: requireNonEmptyString(
      parsed.ACTIVE_BUSINESS,
      'ACTIVE_BUSINESS',
    ),
    INACTIVE_BUSINESS: requireNonEmptyString(
      parsed.INACTIVE_BUSINESS,
      'INACTIVE_BUSINESS',
    ),
    REQUIRED_FORMS_BUSINESS: requireNonEmptyString(
      parsed.REQUIRED_FORMS_BUSINESS,
      'REQUIRED_FORMS_BUSINESS',
    ),
    DELINQUENCY_BUSINESS: requireNonEmptyString(
      parsed.DELINQUENCY_BUSINESS,
      'DELINQUENCY_BUSINESS',
    ),
    FILINGS_BUSINESS: requireNonEmptyString(
      parsed.FILINGS_BUSINESS,
      'FILINGS_BUSINESS',
    ),
    DEFAULT_BUSINESS: requireNonEmptyString(
      parsed.DEFAULT_BUSINESS,
      'DEFAULT_BUSINESS',
    ),
    FUNDED_BUSINESS: requireNonEmptyString(
      parsed.FUNDED_BUSINESS,
      'FUNDED_BUSINESS',
    ),
    DRAFT_BUSINESS: requireNonEmptyString(
      parsed.DRAFT_BUSINESS,
      'DRAFT_BUSINESS',
    ),
    ZERO_PAYMENT_BUSINESS: requireNonEmptyString(
      parsed.ZERO_PAYMENT_BUSINESS,
      'ZERO_PAYMENT_BUSINESS',
    ),
  } satisfies ResourceSlotPayload;

  if (payload.SLOT_ID !== expectedSlotId) {
    throw new Error(
      `Invalid filings resource slot: SLOT_ID does not match ${EXPECTED_SLOT_ID_ENV}.`,
    );
  }

  requireSelectedSlotUniqueness(payload);

  return {
    id: payload.SLOT_ID,
    accounts: {
      taxpayer: {
        username: payload.TAXPAYER_USERNAME,
        password: payload.TAXPAYER_PASSWORD,
      },
      municipal: {
        username: payload.MUNICIPAL_USERNAME,
        password: payload.MUNICIPAL_PASSWORD,
      },
      ags: {
        username: payload.AGS_USERNAME,
        password: payload.AGS_PASSWORD,
      },
    },
    businesses: {
      default: payload.DEFAULT_BUSINESS,
      funded: payload.FUNDED_BUSINESS,
      draft: payload.DRAFT_BUSINESS,
      zeroPayment: payload.ZERO_PAYMENT_BUSINESS,
    },
  };
}

export function loadResourceSlotFromEnvironment(): ResourceSlot {
  const rawJson = process.env[RESOURCE_SLOT_ENV];
  if (rawJson === undefined) {
    throw new Error(`${RESOURCE_SLOT_ENV} is required for filings tests.`);
  }

  const expectedSlotId = process.env[EXPECTED_SLOT_ID_ENV];
  if (expectedSlotId === undefined) {
    throw new Error(`${EXPECTED_SLOT_ID_ENV} is required for filings tests.`);
  }

  return parseResourceSlot(rawJson, expectedSlotId);
}

export async function getResourceSlot(parallelIndex: number): Promise<ResourceSlot> {
  if (parallelIndex !== 0) {
    throw new Error(
      'Filings matrix jobs require parallelIndex 0; configure exactly one Playwright worker per selected slot.',
    );
  }

  return loadResourceSlotFromEnvironment();
}

export function getCredentialsForAccountType(
  slot: ResourceSlot,
  accountType: AccountType,
): Credentials {
  const canonicalAccountType: CanonicalAccountType =
    accountType === 'municipality' ? 'municipal' : accountType;

  return slot.accounts[canonicalAccountType];
}
