import { expect, Page, Response } from "@playwright/test";
import fs from "fs";
import path from "path";

type Credentials = {
  email: string;
  password: string;
};

type AuthFixture = {
  validCredentials?: Credentials;
  invalidCredentials?: Credentials;
};

export type LoginOptions = {
  kind?: "valid" | "invalid";
  email?: string;
  password?: string;
};

const AUTH_FIXTURE_CANDIDATES = [
  path.resolve(process.cwd(), "audit/playwright/fixtures/auth.json"),
  path.resolve(process.cwd(), "playwright/fixtures/auth.json"),
  path.resolve(__dirname, "../../fixtures/auth.json"),
];

const readAuthFixture = (): AuthFixture => {
  for (const fixturePath of AUTH_FIXTURE_CANDIDATES) {
    if (!fs.existsSync(fixturePath)) continue;

    try {
      return JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as AuthFixture;
    } catch {
      return {};
    }
  }

  return {};
};

const resolveCredentials = (options: LoginOptions = {}): Credentials => {
  const fixture = readAuthFixture();
  const kind = options.kind ?? "valid";

  const validFixture = fixture.validCredentials;
  const invalidFixture = fixture.invalidCredentials;

  const fallbackValid: Credentials = {
    email: process.env.TEST_USERNAME ?? validFixture?.email ?? "",
    password: process.env.TEST_PASSWORD ?? validFixture?.password ?? "",
  };

  const fallbackInvalid: Credentials = {
    email:
      process.env.TEST_INVALID_USERNAME ??
      invalidFixture?.email ??
      "invalid-user@example.com",
    password:
      process.env.TEST_INVALID_PASSWORD ??
      invalidFixture?.password ??
      "invalid-password",
  };

  const selected = kind === "invalid" ? fallbackInvalid : fallbackValid;

  return {
    email: options.email ?? selected.email,
    password: options.password ?? selected.password,
  };
};

const getLoginUrl = (): string => {
  if (process.env.AUDIT_LOGIN_URL) return process.env.AUDIT_LOGIN_URL;

  const environment = process.env.environment ?? process.env.ENVIRONMENT;
  if (environment) {
    return `https://${environment}.azavargovapps.com/login`;
  }

  return "/login";
};

export const openLoginPage = async (page: Page): Promise<void> => {
  await page.goto(getLoginUrl());

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if ((await cookieButton.count()) > 0) {
    await cookieButton.click({ force: true }).catch(() => undefined);
  }

  await expect(
    page
      .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In")')
      .first()
  ).toBeVisible();
};

export const waitForAuditAuthLoginResponse = async (
  page: Page,
  expectedStatus?: number
): Promise<Response> => {
  const response = await page.waitForResponse((resp) => {
    return (
      resp.request().method() === "POST" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/auth\/login/.test(resp.url())
    );
  });

  if (expectedStatus !== undefined) {
    expect(response.status()).toBe(expectedStatus);
  }

  return response;
};

export const waitForSelectedDepartmentResponse = async (
  page: Page
): Promise<Response> => {
  const response = await page.waitForResponse((resp) => {
    return (
      resp.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/departments(?:\?.*)?$/.test(resp.url())
    );
  });

  expect(response.status()).toBe(200);
  return response;
};

export const loginViaUi = async (
  page: Page,
  options: LoginOptions = {}
): Promise<Credentials> => {
  const credentials = resolveCredentials(options);

  await openLoginPage(page);

  const emailInput = page
    .locator('input[name="email"], input[type="email"]')
    .first();
  const passwordInput = page
    .locator('input[name="password"], input[type="password"]')
    .first();

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await page
    .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In")')
    .first()
    .click({ force: true });

  return credentials;
};

export const logoutViaUi = async (page: Page): Promise<void> => {
  const profileDropDownButton = page.locator(".profileDropDownButton").last();
  await expect(profileDropDownButton).toBeVisible();
  await profileDropDownButton.click({ force: true });

  const logoutButton = page.getByText("Log out", { exact: false }).first();
  await expect(logoutButton).toBeVisible();
  await logoutButton.click({ force: true });
};
