import { expect, Page } from "@playwright/test";
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
