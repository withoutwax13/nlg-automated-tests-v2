import { expect, type Page } from "@playwright/test";

type AccountType = "ags" | "taxpayer" | "municipal" | "caseManagementTestAccount" | "iail" | "iatx";

export interface LoginOptions {
  accountType: AccountType;
  accountIndex?: number;
}

interface Credential {
  username: string;
  password: string;
}

const asString = (value: string | undefined): string => value ?? "";

const getEnvironment = (): string =>
  asString(process.env.environment || process.env.ENVIRONMENT || "dev");

const tryParseJson = (raw: string | undefined): unknown => {
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const fromCredentialsBlob = (
  accountType: AccountType,
  accountIndex: number,
): Credential | undefined => {
  const parsed =
    tryParseJson(process.env.VALID_CREDENTIALS) ||
    tryParseJson(process.env.validCredentials) ||
    tryParseJson(process.env.CREDENTIALS_FIXTURE);

  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }

  const collection = (parsed as Record<string, unknown>)[accountType];
  if (!Array.isArray(collection)) {
    return undefined;
  }

  const selected = collection[accountIndex] as { username?: unknown; password?: unknown } | undefined;
  if (!selected) {
    return undefined;
  }

  return {
    username: typeof selected.username === "string" ? selected.username : "",
    password: typeof selected.password === "string" ? selected.password : "",
  };
};

const fromEnv = (accountType: AccountType): Credential => {
  const prefix = accountType.toUpperCase();
  return {
    username: asString(process.env[`${prefix}_USERNAME`] || process.env.TEST_USERNAME),
    password: asString(process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD),
  };
};

export const resolveCredentials = (options: LoginOptions): Credential => {
  const accountIndex = options.accountIndex ?? 0;
  const fromBlob = fromCredentialsBlob(options.accountType, accountIndex);

  if (fromBlob && fromBlob.username && fromBlob.password) {
    return fromBlob;
  }

  return fromEnv(options.accountType);
};

export const loginViaUi = async (page: Page, options: LoginOptions): Promise<void> => {
  const credentials = resolveCredentials(options);
  const environment = getEnvironment();

  await page.goto(`https://${environment}.azavargovapps.com/login`);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').first().click({ force: true });

  await expect(page).not.toHaveURL(/\/login$/);
};

export const logoutViaUi = async (page: Page): Promise<void> => {
  await page.locator(".profileDropDownButton").last().click({ force: true });
  await page.getByText("Log out", { exact: false }).first().click({ force: true });
  await expect(page).toHaveURL(/\/login/);
};
