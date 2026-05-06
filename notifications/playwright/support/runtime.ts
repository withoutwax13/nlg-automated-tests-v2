export type AccountType = "taxpayer" | "municipal" | "municipality" | "ags" | "municipalDel";

type Credential = { username: string; password: string };

type CredentialMap = Record<string, Credential[] | Credential>;

const parseJson = <T>(raw: string | undefined): T | null => {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
};

export const getEnvironment = () =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;

export const getCredentials = (accountType: AccountType = "taxpayer", accountIndex = 0): Credential => {
  const normalized = accountType === "municipality" ? "municipal" : accountType;

  const fromEnv =
    parseJson<CredentialMap>(process.env.validCredentials) ||
    parseJson<CredentialMap>(process.env.VALIDCREDENTIALS) ||
    parseJson<CredentialMap>(process.env.VALID_CREDENTIALS);

  if (fromEnv && fromEnv[normalized]) {
    const value = fromEnv[normalized];
    const picked = Array.isArray(value) ? value[Math.min(accountIndex, value.length - 1)] : value;
    if (picked?.username && picked?.password) return picked;
  }

  if (process.env.TEST_USERNAME && process.env.TEST_PASSWORD) {
    return { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD };
  }

  throw new Error(`Missing credentials for account type: ${normalized}`);
};

export const login = async (
  page: import("@playwright/test").Page,
  params: { accountType?: AccountType; accountIndex?: number } = {}
) => {
  const creds = getCredentials(params.accountType || "taxpayer", params.accountIndex || 0);
  await page.goto(`${getBaseUrl()}/login`);
  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }
  await page.locator('[data-cy="email-address"]').fill(creds.username);
  await page.locator('[data-cy="password"]').fill(creds.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();
};
