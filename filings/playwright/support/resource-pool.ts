export type AccountType =
  | 'taxpayer'
  | 'municipal'
  | 'municipality'
  | 'ags'
  | 'municipalDel';

type CanonicalAccountType = Exclude<AccountType, 'municipality'>;
export type BusinessType = 'default' | 'funded' | 'draft' | 'zeroPayment';

export interface Credentials {
  username: string;
  password: string;
}

export interface ResourceSlot {
  id: string;
  accounts: {
    taxpayer: Credentials;
    municipal: Credentials;
    ags: Credentials;
    municipalDel?: Credentials;
  };
  businesses: Record<BusinessType, string>;
}

export interface ResourceSlotPayload {
  VERSION: 1;
  SLOT_ID: string;
  TAXPAYER_USERNAME: string;
  TAXPAYER_PASSWORD: string;
  MUNICIPAL_USERNAME: string;
  MUNICIPAL_PASSWORD: string;
  AGS_USERNAME: string;
  AGS_PASSWORD: string;
  DEFAULT_BUSINESS: string;
  FUNDED_BUSINESS: string;
  DRAFT_BUSINESS: string;
  ZERO_PAYMENT_BUSINESS: string;
}

const RESOURCE_SLOT_ENV = 'FILINGS_RESOURCE_SLOT_JSON';
const EXPECTED_SLOT_ID_ENV = 'FILINGS_EXPECTED_SLOT_ID';
const GITHUB_SECRET_LIMIT_BYTES = 48 * 1024;

const SECRET_FIELD_NAMES = [
  'TAXPAYER_USERNAME',
  'TAXPAYER_PASSWORD',
  'MUNICIPAL_USERNAME',
  'MUNICIPAL_PASSWORD',
  'AGS_USERNAME',
  'AGS_PASSWORD',
  'DEFAULT_BUSINESS',
  'FUNDED_BUSINESS',
  'DRAFT_BUSINESS',
  'ZERO_PAYMENT_BUSINESS',
] as const;

const REQUIRED_FIELD_NAMES = [
  'VERSION',
  'SLOT_ID',
  ...SECRET_FIELD_NAMES,
] as const;

const REQUIRED_FIELD_NAME_SET = new Set<string>(REQUIRED_FIELD_NAMES);
const registeredMasks = new Set<string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(
  value: unknown,
  fieldName: (typeof REQUIRED_FIELD_NAMES)[number],
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

  const businesses = [
    payload.DEFAULT_BUSINESS,
    payload.FUNDED_BUSINESS,
    payload.DRAFT_BUSINESS,
    payload.ZERO_PAYMENT_BUSINESS,
  ].map(normalizeUniqueValue);
  if (new Set(businesses).size !== businesses.length) {
    throw new Error(
      'Invalid filings resource slot: default, funded, draft, and zero-payment businesses must be unique.',
    );
  }
}

// GitHub workflow command message escaping. Escaping percent first prevents the
// escapes introduced for line endings from being escaped a second time.
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
  for (const fieldName of SECRET_FIELD_NAMES) {
    const fieldValue = value[fieldName];
    if (typeof fieldValue === 'string' && fieldValue.length > 0) {
      registerMask(fieldValue);
    }
  }
}

/**
 * Parse the one slot injected into a matrix job. Errors describe only schema
 * locations and never echo the JSON, credentials, or business values.
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    throw new Error(`${RESOURCE_SLOT_ENV} must contain valid JSON.`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`${RESOURCE_SLOT_ENV} must contain a flat JSON object.`);
  }

  // Register every usable field before schema validation can throw and before a
  // caller can log a validation result.
  registerKnownMasks(parsed);

  for (const fieldName of REQUIRED_FIELD_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(parsed, fieldName)) {
      throw new Error(
        `Invalid filings resource slot: required field ${fieldName} is missing.`,
      );
    }
  }
  if (
    Object.keys(parsed).length !== REQUIRED_FIELD_NAMES.length ||
    Object.keys(parsed).some((fieldName) => !REQUIRED_FIELD_NAME_SET.has(fieldName))
  ) {
    throw new Error('Invalid filings resource slot: unknown fields are not allowed.');
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
    DEFAULT_BUSINESS: requireNonEmptyString(
      parsed.DEFAULT_BUSINESS,
      'DEFAULT_BUSINESS',
    ),
    FUNDED_BUSINESS: requireNonEmptyString(
      parsed.FUNDED_BUSINESS,
      'FUNDED_BUSINESS',
    ),
    DRAFT_BUSINESS: requireNonEmptyString(parsed.DRAFT_BUSINESS, 'DRAFT_BUSINESS'),
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
  const credentials = slot.accounts[canonicalAccountType];

  if (!credentials) {
    throw new Error(
      `The selected filings resource slot does not provide credentials for account type ${canonicalAccountType}.`,
    );
  }

  return credentials;
}
