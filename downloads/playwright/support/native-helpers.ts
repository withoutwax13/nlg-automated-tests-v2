import { expect, type Locator, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

type AccountType = "taxpayer" | "municipal" | "ags";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
};

const getEnvironment = (): string =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

const getBaseUrl = (): string => `https://${getEnvironment()}.azavargovapps.com`;

const getCredentials = (accountType: AccountType) => {
  const prefix = accountType.toUpperCase();

  return {
    username: process.env[`${prefix}_USERNAME`] || process.env.TEST_USERNAME || "",
    password: process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD || "",
  };
};

export const clickLocatorByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

export const waitForLoading = async (page: Page, secs = 5) => {
  await page.waitForTimeout(secs * 1000);
};

export const login = async (page: Page, params: LoginParams = {}) => {
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
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();

  await cognitoResponses;
  await expect(page).toHaveURL(`${getBaseUrl()}/`);
};

export const readXlsx = (filePath: string) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
    defval: "",
  });
};

export const saveDownloadAs = async (download: import("@playwright/test").Download, filePath: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await download.saveAs(filePath);
};
