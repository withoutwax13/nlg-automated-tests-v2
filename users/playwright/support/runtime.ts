import { expect, type APIRequestContext, type Locator, type Page, type Response } from "@playwright/test";
import fs from "fs";
import path from "path";

export type AccountType =
  | "taxpayer"
  | "municipal"
  | "ags"
  | "municipalCaseManagement"
  | "iail"
  | "iatx";

export type LoginParams = {
  accountType: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
  customRedirectionAfterLoginAssertion?: (page: Page) => Promise<void> | void;
};

type TestmailConfig = {
  endpoint: string;
  apiKey: string;
  namespace: string;
  domain: string;
};

type Credential = { username: string; password: string };

type CredentialSet = Record<string, Credential[]>;

const runtimeState: {
  page?: Page;
  request?: APIRequestContext;
  values: Map<string, unknown>;
  fixtureData?: Record<string, unknown>;
} = {
  values: new Map<string, unknown>(),
};

const dataFixturePath = path.resolve(__dirname, "..", "fixtures", "data.json");

const readFixtureData = (): Record<string, unknown> | undefined => {
  if (!fs.existsSync(dataFixturePath)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(dataFixturePath, "utf8")) as Record<string, unknown>;
};

const fallbackCredentialList = (): Credential[] =>
  Array.from({ length: 10 }, () => ({
    username: process.env.TEST_USERNAME || "",
    password: process.env.TEST_PASSWORD || "",
  }));

export const bindRuntime = (page: Page, request: APIRequestContext) => {
  runtimeState.page = page;
  runtimeState.request = request;
  runtimeState.values.clear();
  runtimeState.fixtureData = readFixtureData();
};

export const currentPage = (): Page => {
  if (!runtimeState.page) {
    throw new Error("Runtime page is not bound");
  }

  return runtimeState.page;
};

export const currentRequest = (): APIRequestContext => {
  if (!runtimeState.request) {
    throw new Error("Runtime request is not bound");
  }

  return runtimeState.request;
};

export const waitForLoading = async (seconds = 5) => {
  await currentPage().waitForTimeout(seconds * 1000);
};

export const setStoredValue = <T>(key: string, value: T): T => {
  runtimeState.values.set(key, value);
  return value;
};

export const getStoredValue = <T>(key: string): T => {
  if (!runtimeState.values.has(key)) {
    throw new Error(`Stored value not found for key: ${key}`);
  }

  return runtimeState.values.get(key) as T;
};

export const tryGetStoredValue = <T>(key: string): T | undefined =>
  runtimeState.values.get(key) as T | undefined;

export const getEnvironment = (): string =>
  (process.env.environment || process.env.ENVIRONMENT || "dev").trim();

export const getTestmail = (): TestmailConfig => {
  const rawJson = process.env.TESTMAIL || process.env.testmail;
  let parsed: Partial<TestmailConfig> | undefined;

  if (rawJson) {
    try {
      parsed = JSON.parse(rawJson) as Partial<TestmailConfig>;
    } catch {
      parsed = undefined;
    }
  }

  return {
    endpoint: process.env.TESTMAIL_ENDPOINT || parsed?.endpoint || "https://api.testmail.app/api/json",
    apiKey: process.env.TESTMAIL_APIKEY || parsed?.apiKey || "",
    namespace: process.env.TESTMAIL_NAMESPACE || parsed?.namespace || "",
    domain: process.env.TESTMAIL_DOMAIN || parsed?.domain || "inbox.testmail.app",
  };
};

export const getValidCredentials = (): CredentialSet => {
  const fixtureCredentials = runtimeState.fixtureData?.accounts as CredentialSet | undefined;
  if (fixtureCredentials) {
    return fixtureCredentials;
  }

  const fallback = fallbackCredentialList();
  return {
    taxpayer: fallback,
    municipal: fallback,
    ags: fallback,
    caseManagementTestAccount: fallback,
    iail: fallback,
    iatx: fallback,
  };
};

const getAccountCredentials = (accountType: AccountType, accountIndex = 0): Credential => {
  const credentials = getValidCredentials();

  if (accountType === "municipalCaseManagement") {
    return credentials.caseManagementTestAccount[accountIndex];
  }

  return credentials[accountType][accountIndex];
};

const getExpectedPath = (accountType: AccountType) => {
  switch (accountType) {
    case "taxpayer":
      return "/BusinessesApp/BusinessesList";
    case "municipal":
    case "municipalCaseManagement":
    case "iail":
    case "iatx":
      return "/filingApp/filingList";
    case "ags":
      return "/";
    default:
      return "/";
  }
};

const matchesLeadFlow = (response: Response) =>
  response.request().method() === "GET" &&
  response.url().includes("hubspot.com/lead-flows-config/");

const matchesCognito = (response: Response) =>
  response.request().method() === "POST" &&
  response.url().includes("cognito-idp.") &&
  response.url().includes(".amazonaws.com/");

export const expectPathname = async (expected: string | RegExp) => {
  const pathname = new URL(currentPage().url()).pathname;

  if (expected instanceof RegExp) {
    expect(pathname).toMatch(expected);
  } else {
    expect(pathname).toBe(expected);
  }
};

export const login = async ({
  accountType,
  accountIndex = 0,
  notFirstLogin = false,
  customRedirectionAfterLoginAssertion,
}: LoginParams) => {
  const page = currentPage();
  const credentials = getAccountCredentials(accountType, accountIndex);
  const leadFlowResponse = page.waitForResponse(matchesLeadFlow).catch(() => undefined);
  const cognitoResponses = Promise.all([
    page.waitForResponse(matchesCognito),
    page.waitForResponse(matchesCognito),
  ]);

  await page.goto("/login");
  await leadFlowResponse;
  await expectPathname("/login");

  if (!notFirstLogin) {
    const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click({ force: true });
    }
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(credentials.password);
  await page.locator('[data-cy="sign-in"]').first().click();

  await cognitoResponses;

  if (customRedirectionAfterLoginAssertion) {
    await customRedirectionAfterLoginAssertion(page);
    return;
  }

  await expectPathname(getExpectedPath(accountType));
};

export const logout = async () => {
  const page = currentPage();
  await page.locator(".profileDropDownButton").last().click();
  await page.locator("span").filter({ hasText: "Log out" }).first().click();
  await expectPathname("/login");
};

export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await currentRequest().get(url);
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as T;
};

export const clickText = async (locator: Locator, text: string | RegExp) => {
  await locator.filter({ hasText: text }).first().click();
};

export const fillDateInput = async (locator: Locator, value: string) => {
  await locator.click();
  await locator.pressSequentially(value, { delay: 10 });
};

export const normalizeWhitespace = (value: string | null | undefined): string =>
  (value || "").replace(/\s+/g, " ").trim();

export const labelValue = (labelText: string): Locator =>
  currentPage()
    .locator("label")
    .filter({ hasText: labelText })
    .first()
    .locator("xpath=..")
    .locator("xpath=following-sibling::*[1]");

export const listItem = (text: string | RegExp): Locator =>
  currentPage().locator("li").filter({ hasText: text }).first();

export const buttonByText = (text: string | RegExp): Locator =>
  currentPage().locator("button").filter({ hasText: text }).first();
