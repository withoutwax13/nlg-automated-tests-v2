import { expect, type APIRequestContext, type Locator, type Page, type Response } from "@playwright/test";
import path from "path";
import data from "../fixtures/data";

type AccountType = "taxpayer" | "municipal" | "municipality" | "ags" | "municipalDel";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

type DeleteBusinessDataParams = {
  dba: string;
  userType: AccountType;
  notFirstLogin: boolean;
  accountIndex?: number;
};

type DateParts = { month: string | number; day?: string | number; date?: string | number; year: string | number };

type RuntimeState = { page?: Page; request?: APIRequestContext };
const runtime: RuntimeState = {};

const normalizeAccountType = (accountType: AccountType | string) =>
  accountType === "municipality" ? "municipal" : accountType;
const pad = (value: string | number) => String(value).padStart(2, "0");
const isHubspotConfig = (url: string) => url.includes("hubspot.com/lead-flows-config/");
const isAwsCognito = (url: string) => url.includes("cognito-idp.") && url.includes(".amazonaws.com/");

export const normalizeText = (value: string | null | undefined) => (value || "").replace(/\s+/g, " ").trim();
export const getEnvironment = () => process.env.environment || process.env.ENVIRONMENT || "dev";
export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;
export const applicationBaseUrl = getBaseUrl;

const parseEnvCredentials = () => {
  const raw = process.env.validCredentials || process.env.VALIDCREDENTIALS || process.env.VALID_CREDENTIALS;
  if (!raw) return undefined;
  try { return JSON.parse(raw) as Record<AccountType, { username: string; password: string }[]>; } catch { return undefined; }
};

const credentials = (data as any).accounts || (data as any).validCredentials || parseEnvCredentials() || {};

export const bindRuntime = (page: Page, request: APIRequestContext) => {
  runtime.page = page;
  runtime.request = request;
};

export const currentPage = (page?: Page): Page => {
  if (page) return page;
  if (!runtime.page) throw new Error("Runtime page is not bound");
  return runtime.page;
};

export const currentRequest = (): APIRequestContext => {
  if (!runtime.request) throw new Error("Runtime request is not bound");
  return runtime.request;
};

export const waitForLoading = async (arg1?: number | Page, arg2?: number) => {
  const page = typeof arg1 === "object" ? arg1 : currentPage();
  const seconds = (typeof arg1 === "number" ? arg1 : arg2) ?? 5;
  await page.waitForTimeout(seconds * 1000);
};

export const expectPathname = async (expected: string | RegExp, page?: Page) => {
  const pathname = new URL(currentPage(page).url()).pathname;
  if (expected instanceof RegExp) { expect(pathname).toMatch(expected); return; }
  expect(pathname).toBe(expected);
};

export const expectCurrentUrlToInclude = async (expected: string, page?: Page) => {
  expect(currentPage(page).url()).toContain(expected);
};

export const listItem = (text: string | RegExp, page?: Page): Locator => currentPage(page).locator("li").filter({ hasText: text }).first();
export const buttonByText = (text: string | RegExp, page?: Page): Locator => currentPage(page).locator("button").filter({ hasText: text }).first();
export const labelValue = (labelText: string, page?: Page): Locator =>
  currentPage(page).locator("label").filter({ hasText: labelText }).first().locator("xpath=..").locator("xpath=following-sibling::*[1]");

export const fillDateInput = async (locator: Locator, date: { month: number | string; date?: number | string; day?: number | string; year: number | string }) => {
  const day = date.date ?? date.day;
  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(String(date.month), { delay: 10 });
  if (day !== undefined) { await locator.press("ArrowRight"); await locator.pressSequentially(String(day), { delay: 10 }); }
  await locator.press("ArrowRight");
  await locator.press("ArrowRight");
  await locator.pressSequentially(String(date.year), { delay: 10 });
};

export const waitForResponse = async (page: Page, matcher: string | RegExp | ((response: Response) => boolean), action?: () => Promise<void> | void) => {
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

export const formatDate = ({ month, year, day, date }: DateParts) => `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;

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
    if (columns.includes(text)) result[text] = index;
  }
  return result;
};

export const getVisibilityStatus = (columns: string[], order: Record<string, number>) => Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));
export const getRowCells = (row: Locator) => row.locator("td");

export const findRowByCellValue = async (rows: Locator, columnIndex: number, value: string, exact = true) => {
  const count = await rows.count();
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const cellText = normalizeText(await getRowCells(row).nth(columnIndex).textContent());
    if ((exact && cellText === value) || (!exact && cellText.includes(value))) return row;
  }
  return null;
};

export const getPagerTotal = async (pagerInfo: Locator) => {
  const text = normalizeText(await pagerInfo.textContent());
  const match = text.match(/of\s+([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};

const expectedPathByAccountType = (accountType: AccountType) => {
  switch (accountType) {
    case "taxpayer": return "/BusinessesApp/BusinessesList";
    case "municipal":
    case "municipality": return "/filingApp/filingList";
    case "ags": return "/";
    default: return "/";
  }
};

export const login = async (arg1?: Page | LoginParams, arg2?: LoginParams) => {
  const page = arg1 && typeof arg1 === "object" && "goto" in arg1 ? (arg1 as Page) : currentPage();
  const params = (arg1 && typeof arg1 === "object" && "goto" in arg1 ? arg2 : arg1) as LoginParams | undefined;
  const { accountType = "taxpayer", accountIndex = 0, notFirstLogin = false } = params || {};

  const account = credentials?.[normalizeAccountType(accountType)]?.[accountIndex] || credentials?.[normalizeAccountType(accountType)]?.[0] || {
    username: process.env[`${normalizeAccountType(accountType).toUpperCase()}_USERNAME`] || process.env.TEST_USERNAME || "",
    password: process.env[`${normalizeAccountType(accountType).toUpperCase()}_PASSWORD`] || process.env.TEST_PASSWORD || "",
  };

  const leadFlowConfig = page.waitForResponse((response) => response.request().method() === "GET" && isHubspotConfig(response.url())).catch(() => undefined);
  const cognitoResponses = Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
  ]);

  await page.goto("/login");
  await leadFlowConfig;
  await expectPathname("/login", page);

  if (!notFirstLogin) {
    const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
    if (await cookieButton.isVisible().catch(() => false)) await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(account.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(account.username);
  await page.locator('[data-cy="password"]').fill(account.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(account.password);
  await page.locator('[data-cy="sign-in"]').first().click();

  await cognitoResponses;
  await expectPathname(expectedPathByAccountType(accountType), page);
};

export const logout = async (page?: Page) => {
  const p = currentPage(page);
  await p.locator(".profileDropDownButton").last().click();
  await p.locator("span").filter({ hasText: "Log out" }).first().click();
  await expectPathname("/login", p);
};

export const fixturePath = (...parts: string[]) => path.resolve(__dirname, "..", "fixtures", ...parts);

export const deleteBusinessData = async ({ dba, userType, notFirstLogin, accountIndex = 0 }: DeleteBusinessDataParams) => {
  const { default: BusinessGrid } = await import("../objects/BusinessGrid");
  const municipalitySelection = userType === "ags" ? "Arrakis" : undefined;
  const grid = new BusinessGrid({ userType, municipalitySelection });

  await login({ accountType: userType, notFirstLogin, accountIndex });
  await grid.init();
  await grid.filterColumn("DBA", dba);

  if (!(await grid.isNoRecordsVisible())) {
    await grid.clickClearAllFiltersButton();
    await grid.deleteBusiness(dba);
    await expect(grid.getElement().toastComponent()).toBeVisible();
  }

  await logout();
};
