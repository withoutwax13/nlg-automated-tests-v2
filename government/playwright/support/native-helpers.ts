import { expect, type Locator, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "ags";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
};

type ResponsePattern = {
  method: string;
  urlPart: string;
};

export const getEnvironment = (): string =>
  process.env.environment || process.env.ENVIRONMENT || "dev";


const normalizeAccountType = (accountType: AccountType | string) =>
  accountType === "municipality" ? "municipal" : accountType;
export const getBaseUrl = (): string => `https://${getEnvironment()}.azavargovapps.com`;

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

export const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

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

export const waitForLoading = async (page: Page, seconds = 5) => {
  await page.waitForTimeout(seconds * 1000);
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


export const waitForResponse = async (
  page: Page,
  matcher: string | RegExp | ((response: Response) => boolean),
  action?: () => Promise<void> | void
) => {
  const predicate = typeof matcher === "function" ? matcher : (response: Response) => typeof matcher === "string" ? response.url().includes(matcher) : matcher.test(response.url());
  const responsePromise = page.waitForResponse(predicate);
  if (action) await action();
  return responsePromise;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

type DateParts = { month: string | number; day?: string | number; date?: string | number; year: string | number };
const pad = (value: string | number) => String(value).padStart(2, "0");
export const formatDate = ({ month, year, day, date }: DateParts) => `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;
export const setMaskedDateInput = async (input: Locator, value: DateParts) => { await input.click(); await input.fill(formatDate(value)); await input.press("Tab"); };
export const getColumnOrder = async (headerLocator: Locator, columns: string[]) => { const result: Record<string, number> = {}; const count = await headerLocator.count(); for (let i=0;i<count;i+=1){ const text=normalizeText(await headerLocator.nth(i).textContent()); if(columns.includes(text)) result[text]=i;} return result; };
export const getVisibilityStatus = (columns: string[], order: Record<string, number>) => Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));
export const getRowCells = (row: Locator) => row.locator("td");
export const findRowByCellValue = async (rows: Locator, columnIndex: number, value: string, exact = true) => { const count = await rows.count(); for (let i=0;i<count;i+=1){ const row=rows.nth(i); const cellText=normalizeText(await getRowCells(row).nth(columnIndex).textContent()); if ((exact && cellText===value) || (!exact && cellText.includes(value))) return row; } return null; };
export const getPagerTotal = async (pagerInfo: Locator) => { const text = normalizeText(await pagerInfo.textContent()); const match = text.match(/of\s+([\d,]+)/i); return match ? Number(match[1].replace(/,/g, "")) : 0; };
