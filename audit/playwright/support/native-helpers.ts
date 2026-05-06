import { expect, type Locator, type Page, type Response } from "@playwright/test";
import fs from "fs";
import path from "path";
import LoginUtils from "../utils/Login";

type LoginParams = { email?: string; password?: string; manualAuth?: boolean };

type AuthFixture = {
  validCredentials: { email: string; password: string };
  invalidCredentials: { email: string; password: string };
};

const parseValidCredentialsEnv = () => {
  const raw =
    process.env.validCredentials ||
    process.env.VALIDCREDENTIALS ||
    process.env.VALID_CREDENTIALS;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as {
      taxpayer?: Array<{ username?: string; email?: string; password: string }>;
    };
  } catch {
    return undefined;
  }
};

const resolveLoginCreds = (manualAuth: boolean, params: LoginParams, auth: AuthFixture) => {
  if (manualAuth) {
    return {
      email: params.email || auth.invalidCredentials.email,
      password: params.password || auth.invalidCredentials.password,
    };
  }

  const envCred = parseValidCredentialsEnv()?.taxpayer?.[0];
  return {
    email: params.email || envCred?.email || envCred?.username || auth.validCredentials.email,
    password: params.password || envCred?.password || auth.validCredentials.password,
  };
};

const readAuthFixture = (): AuthFixture => {
  const fixturePath = path.resolve(__dirname, "..", "fixtures", "auth.json");
  return JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as AuthFixture;
};

export const login = async (page: Page, params: LoginParams = {}) => {
  const auth = readAuthFixture();
  const manualAuth = !!params.manualAuth;
  const creds = resolveLoginCreds(manualAuth, params, auth);

  const loginWaiter = !manualAuth
    ? LoginUtils.interceptAuditAuthLogin(page)
    : undefined;
  const departmentWaiters = !manualAuth
    ? LoginUtils.interceptDepartments(page)
    : [];

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(creds.email);
  await page.locator('input[name="password"]').fill(creds.password);
  await page.locator("button[type='submit']").click();

  if (!manualAuth && loginWaiter) {
    await LoginUtils.waitForAuditAuthLogin(loginWaiter);
    await LoginUtils.waitForDepartments(departmentWaiters);
  }
};

export const logout = async (page: Page) => {
  await page
    .locator("nav")
    .locator("ul")
    .locator("li")
    .nth(2)
    .locator("a")
    .nth(1)
    .click();
};

export const expectPathname = async (page: Page, expected: string | RegExp) => {
  const url = new URL(page.url());
  if (expected instanceof RegExp) {
    expect(url.pathname).toMatch(expected);
  } else {
    expect(url.pathname).toBe(expected);
  }
};

export const waitForSearchResults = async (page: Page) => {
  const response = await page.waitForResponse(
    (res) =>
      res.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/audits\?.*keyword=.*/.test(
        res.url()
      )
  );
  expect(response.status()).toBe(200);
  await page.waitForTimeout(3000);
};


export const normalizeText = (value: string | null | undefined) => (value || "").replace(/\s+/g, " ").trim();
export const getEnvironment = () => process.env.environment || process.env.ENVIRONMENT || "dev";
export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;
export const waitForLoading = async (page: Page, seconds = 5) => { await page.waitForTimeout(seconds * 1000); };
export const waitForResponse = async (page: Page, matcher: string | RegExp | ((response: Response) => boolean), action?: () => Promise<void> | void) => {
  const predicate = typeof matcher === "function" ? matcher : (response: Response) => typeof matcher === "string" ? response.url().includes(matcher) : matcher.test(response.url());
  const responsePromise = page.waitForResponse(predicate); if (action) await action(); return responsePromise;
};
export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => { const response = await responsePromise; expect(response.status()).toBe(expectedStatus); return response; };
export const clickByText = async (locator: Locator, text: string) => { await locator.filter({ hasText: text }).first().click(); };
type DateParts = { month: string | number; day?: string | number; date?: string | number; year: string | number };
const pad = (value: string | number) => String(value).padStart(2, "0");
export const formatDate = ({ month, year, day, date }: DateParts) => `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;
export const setMaskedDateInput = async (input: Locator, value: DateParts) => { await input.click(); await input.fill(formatDate(value)); await input.press("Tab"); };
export const getColumnOrder = async (headerLocator: Locator, columns: string[]) => { const result: Record<string, number> = {}; const count = await headerLocator.count(); for (let i=0;i<count;i+=1){ const text=normalizeText(await headerLocator.nth(i).textContent()); if(columns.includes(text)) result[text]=i;} return result; };
export const getVisibilityStatus = (columns: string[], order: Record<string, number>) => Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));
export const getRowCells = (row: Locator) => row.locator("td");
export const findRowByCellValue = async (rows: Locator, columnIndex: number, value: string, exact = true) => { const count = await rows.count(); for (let i=0;i<count;i+=1){ const row=rows.nth(i); const cellText=normalizeText(await getRowCells(row).nth(columnIndex).textContent()); if ((exact && cellText===value) || (!exact && cellText.includes(value))) return row; } return null; };
export const getPagerTotal = async (pagerInfo: Locator) => { const text = normalizeText(await pagerInfo.textContent()); const match = text.match(/of\s+([\d,]+)/i); return match ? Number(match[1].replace(/,/g, "")) : 0; };
