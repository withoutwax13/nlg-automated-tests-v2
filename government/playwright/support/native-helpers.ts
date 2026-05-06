import { expect, type Locator, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "ags";

type LoginParams = {
  accountType?: AccountType;
};

type ResponsePattern = {
  method: string;
  urlPart: string;
};

const getEnvironment = (): string =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

const getBaseUrl = (): string => `https://${getEnvironment()}.azavargovapps.com`;

const parseValidCredentialsEnv = () => {
  const raw =
    process.env.validCredentials ||
    process.env.VALIDCREDENTIALS ||
    process.env.VALID_CREDENTIALS;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<AccountType, { username: string; password: string }[]>;
  } catch {
    return undefined;
  }
};

const getCredentials = (accountType: AccountType) => {
  const envMap = parseValidCredentialsEnv();
  const fromMap = envMap?.[accountType]?.[0];
  if (fromMap?.username && fromMap?.password) {
    return fromMap;
  }

  const prefix = accountType.toUpperCase();

  return {
    username:
      process.env[`${prefix}_USERNAME`] ||
      process.env.TEST_USERNAME ||
      "",
    password:
      process.env[`${prefix}_PASSWORD`] ||
      process.env.TEST_PASSWORD ||
      "",
  };
};

const matchesResponse = (
  response: Response,
  { method, urlPart }: ResponsePattern
): boolean =>
  response.request().method() === method && response.url().includes(urlPart);

export const waitForApiResponse = async (
  page: Page,
  pattern: ResponsePattern
): Promise<Response> => {
  const response = await page.waitForResponse((candidate) =>
    matchesResponse(candidate, pattern)
  );

  expect(response.status(), `${pattern.method} ${pattern.urlPart}`).toBe(200);
  return response;
};

export const clickLocatorByText = async (
  locator: Locator,
  text: string
): Promise<void> => {
  await locator.filter({ hasText: text }).first().click();
};

export const expectLocatorWithText = async (
  locator: Locator,
  text: string
): Promise<void> => {
  await expect(locator.filter({ hasText: text }).first()).toBeVisible();
};

export const login = async (
  page: Page,
  params: LoginParams = {}
): Promise<void> => {
  const accountType = params.accountType || "taxpayer";
  const credentials = getCredentials(accountType);

  const leadFlowResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().includes("hubspot.com/lead-flows-config/")
  );
  const cognitoResponses = Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("cognito-idp.") &&
        response.url().includes(".amazonaws.com/")
    ),
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("cognito-idp.") &&
        response.url().includes(".amazonaws.com/")
    ),
  ]);

  await page.goto(`${getBaseUrl()}/login`);
  await leadFlowResponse;
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(
    credentials.username
  );

  await page.locator('[data-cy="password"]').fill(credentials.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(
    credentials.password
  );

  await page
    .locator('[data-cy="sign-in"]')
    .filter({ hasText: "Sign In" })
    .first()
    .click();

  await cognitoResponses;
  await expect(page).toHaveURL(`${getBaseUrl()}/`);
};
