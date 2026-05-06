import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import path from "path";
import data from "../fixtures/data";

export type AccountType = "taxpayer" | "municipal" | "ags";

export type LoginParams = {
  accountType: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

export type DeleteBusinessDataParams = {
  dba: string;
  userType: AccountType;
  notFirstLogin: boolean;
  accountIndex?: number;
};

type RuntimeState = {
  page?: Page;
  request?: APIRequestContext;
};

const runtime: RuntimeState = {};

const isHubspotConfig = (url: string) => url.includes("hubspot.com/lead-flows-config/");
const isAwsCognito = (url: string) => url.includes("cognito-idp.") && url.includes(".amazonaws.com/");

const getEnvironment = () => (process.env.environment || process.env.ENVIRONMENT || "dev").trim();

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

export const currentPage = (): Page => {
  if (!runtime.page) {
    throw new Error("Runtime page is not bound");
  }

  return runtime.page;
};

export const currentRequest = (): APIRequestContext => {
  if (!runtime.request) {
    throw new Error("Runtime request is not bound");
  }

  return runtime.request;
};

export const waitForLoading = async (seconds = 5) => {
  await currentPage().waitForTimeout(seconds * 1000);
};

export const expectPathname = async (expected: string | RegExp) => {
  const pathname = new URL(currentPage().url()).pathname;

  if (expected instanceof RegExp) {
    expect(pathname).toMatch(expected);
    return;
  }

  expect(pathname).toBe(expected);
};

export const expectCurrentUrlToInclude = async (expected: string) => {
  expect(currentPage().url()).toContain(expected);
};

export const listItem = (text: string | RegExp): Locator =>
  currentPage().locator("li").filter({ hasText: text }).first();

export const buttonByText = (text: string | RegExp): Locator =>
  currentPage().locator("button").filter({ hasText: text }).first();

export const labelValue = (labelText: string): Locator =>
  currentPage()
    .locator("label")
    .filter({ hasText: labelText })
    .first()
    .locator("xpath=..")
    .locator("xpath=following-sibling::*[1]");

export const fillDateInput = async (
  locator: Locator,
  date: { month: number | string; date?: number | string; day?: number | string; year: number | string },
) => {
  const day = date.date ?? date.day;

  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(String(date.month), { delay: 10 });

  if (day !== undefined) {
    await locator.press("ArrowRight");
    await locator.pressSequentially(String(day), { delay: 10 });
  }

  await locator.press("ArrowRight");
  await locator.press("ArrowRight");
  await locator.pressSequentially(String(date.year), { delay: 10 });
};

const expectedPathByAccountType = (accountType: AccountType) => {
  switch (accountType) {
    case "taxpayer":
      return "/BusinessesApp/BusinessesList";
    case "municipal":
      return "/filingApp/filingList";
    case "ags":
      return "/";
  }
};

export const login = async ({
  accountType,
  accountIndex = 0,
  notFirstLogin = false,
}: LoginParams) => {
  const page = currentPage();
  const account =
    credentials?.[accountType]?.[accountIndex] ||
    credentials?.[accountType]?.[0] ||
    {
      username: process.env[`${accountType.toUpperCase()}_USERNAME`] || process.env.TEST_USERNAME || "",
      password: process.env[`${accountType.toUpperCase()}_PASSWORD`] || process.env.TEST_PASSWORD || "",
    };
  const leadFlowConfig = page
    .waitForResponse((response) => response.request().method() === "GET" && isHubspotConfig(response.url()))
    .catch(() => undefined);
  const cognitoResponses = Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
  ]);

  await page.goto("/login");
  await leadFlowConfig;
  await expectPathname("/login");

  if (!notFirstLogin) {
    const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click({ force: true });
    }
  }

  await page.locator('[data-cy="email-address"]').fill(account.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(account.username);
  await page.locator('[data-cy="password"]').fill(account.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(account.password);
  await page.locator('[data-cy="sign-in"]').first().click();

  await cognitoResponses;
  await expectPathname(expectedPathByAccountType(accountType));
};

export const logout = async () => {
  const page = currentPage();
  await page.locator(".profileDropDownButton").last().click();
  await page.locator("span").filter({ hasText: "Log out" }).first().click();
  await expectPathname("/login");
};

export const fixturePath = (...parts: string[]) => path.resolve(__dirname, "..", "fixtures", ...parts);

export const deleteBusinessData = async ({
  dba,
  userType,
  notFirstLogin,
  accountIndex = 0,
}: DeleteBusinessDataParams) => {
  const { default: BusinessGrid } = await import("../objects/BusinessGrid");
  const municipalitySelection = userType === "ags" ? "Arrakis" : undefined;
  const grid = new BusinessGrid({ userType, municipalitySelection });

  await login({
    accountType: userType,
    notFirstLogin,
    accountIndex,
  });

  await grid.init();
  await grid.filterColumn("DBA", dba);

  if (!(await grid.isNoRecordsVisible())) {
    await grid.clickClearAllFiltersButton();
    await grid.deleteBusiness(dba);
    await expect(grid.getElement().toastComponent()).toBeVisible();
  }

  await logout();
};

export const applicationBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;
