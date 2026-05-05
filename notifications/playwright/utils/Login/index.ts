import { expect, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "ags";

type LoginParams = {
  accountType?: AccountType;
};

type ResponsePattern = {
  method: string;
  urlPart: string;
};

const getCredentials = (accountType: AccountType) => {
  const prefix = accountType.toUpperCase();

  return {
    username: process.env[`${prefix}_USERNAME`] || process.env.TEST_USERNAME || "",
    password: process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD || "",
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

  await page.goto("/login");
  await leadFlowResponse;
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(credentials.username);

  await page.locator('[data-cy="password"]').fill(credentials.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(credentials.password);

  await page
    .locator('[data-cy="sign-in"]')
    .filter({ hasText: "Sign In" })
    .first()
    .click();

  await cognitoResponses;
  await expect(page).toHaveURL(/\/$/);
};
