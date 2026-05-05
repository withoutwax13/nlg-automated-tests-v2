import { expect, type Locator, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "municipality" | "ags";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
};

type DateParts = {
  month: string | number;
  day?: string | number;
  date?: string | number;
  year: string | number;
};

const normalizeAccountType = (accountType: AccountType) =>
  accountType === "municipality" ? "municipal" : accountType;

const pad = (value: string | number) => String(value).padStart(2, "0");

export const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

export const getEnvironment = () =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;

const getCredentials = (accountType: AccountType, accountIndex = 0) => {
  const normalizedType = normalizeAccountType(accountType);
  const envCredentials = process.env.validCredentials || process.env.VALID_CREDENTIALS;

  if (envCredentials) {
    try {
      const parsed = JSON.parse(envCredentials);
      const entry = parsed?.[normalizedType]?.[accountIndex] || parsed?.[normalizedType]?.[0];
      if (entry?.username && entry?.password) {
        return entry;
      }
    } catch {
      // Ignore invalid JSON and fall through to flat env vars.
    }
  }

  const prefix = normalizedType.toUpperCase();
  return {
    username: process.env[`${prefix}_USERNAME`] || process.env.TEST_USERNAME || "",
    password: process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD || "",
  };
};

export const waitForLoading = async (page: Page, seconds = 5) => {
  await page.waitForTimeout(seconds * 1000);
};

export const waitForResponse = async (
  page: Page,
  matcher: string | RegExp | ((response: Response) => boolean),
  action?: () => Promise<void> | void
) => {
  const predicate =
    typeof matcher === "function"
      ? matcher
      : (response: Response) =>
          typeof matcher === "string"
            ? response.url().includes(matcher)
            : matcher.test(response.url());

  const responsePromise = page.waitForResponse(predicate);
  if (action) {
    await action();
  }
  const response = await responsePromise;
  return response;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

export const formatDate = ({ month, year, day, date }: DateParts) =>
  `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;

export const setMaskedDateInput = async (input: Locator, value: DateParts) => {
  await input.click();
  await input.fill(formatDate(value));
  await input.press("Tab");
};

export const getColumnOrder = async (headerLocator: Locator, columns: string[]) => {
  const result: Record<string, number> = {};
  const count = await headerLocator.count();

  for (let index = 0; index < count; index += 1) {
    const text = normalizeText(await headerLocator.nth(index).textContent());
    if (columns.includes(text)) {
      result[text] = index;
    }
  }

  return result;
};

export const getVisibilityStatus = (columns: string[], order: Record<string, number>) =>
  Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));

export const getRowCells = (row: Locator) => row.locator("td");

export const findRowByCellValue = async (
  rows: Locator,
  columnIndex: number,
  value: string,
  exact = true
) => {
  const count = await rows.count();

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const cellText = normalizeText(await getRowCells(row).nth(columnIndex).textContent());
    if ((exact && cellText === value) || (!exact && cellText.includes(value))) {
      return row;
    }
  }

  return null;
};

export const getPagerTotal = async (pagerInfo: Locator) => {
  const text = normalizeText(await pagerInfo.textContent());
  const match = text.match(/of\s+([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};

export const login = async (page: Page, params: LoginParams = {}) => {
  const accountType = params.accountType || "taxpayer";
  const credentials = getCredentials(accountType, params.accountIndex);

  const leadFlowPromise = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().includes("hubspot.com/lead-flows-config/")
  );
  const cognitoPromises = Promise.all([
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
  await leadFlowPromise;
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();

  await cognitoPromises;
  await expect(page).toHaveURL(`${getBaseUrl()}/`);
};
