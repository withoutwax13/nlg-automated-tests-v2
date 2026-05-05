import fs from "fs";
import path from "path";
import { Page, expect } from "@playwright/test";

type LoginOptions = {
  accountType?: string;
  accountIndex?: number;
  redirectPath?: string;
};

type Account = {
  username?: string;
  email?: string;
  password?: string;
};

type AccountConfig = Record<string, Account[]>;

function readAccounts(projectRoot: string): AccountConfig {
  const candidates = [
    path.join(projectRoot, "cypress", "fixtures", "accounts.json"),
    path.join(projectRoot, "playwright", "fixtures", "accounts.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, "utf-8"));
    }
  }

  return {};
}

function pickAccount(accounts: AccountConfig, accountType: string, accountIndex: number): Account {
  const list = accounts[accountType] || [];
  return list[accountIndex] || list[0] || {};
}

export async function loginViaUi(
  page: Page,
  projectRoot: string,
  options: LoginOptions = {}
): Promise<void> {
  const accountType = options.accountType || "municipal";
  const accountIndex = options.accountIndex || 0;
  const redirectPath = options.redirectPath || "/home";

  const accounts = readAccounts(projectRoot);
  const account = pickAccount(accounts, accountType, accountIndex);

  const email =
    process.env.PW_EMAIL ||
    process.env.E2E_EMAIL ||
    account.username ||
    account.email ||
    "";
  const password =
    process.env.PW_PASSWORD ||
    process.env.E2E_PASSWORD ||
    account.password ||
    "";

  await page.goto('/login');

  const emailInput = page.locator('input[type="email"], input[name="email"], #username');
  if (await emailInput.count()) {
    await emailInput.first().fill(email);
  }

  const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
  if (await passwordInput.count()) {
    await passwordInput.first().fill(password);
  }

  const submitButton = page.locator(
    'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")'
  );
  if (await submitButton.count()) {
    await Promise.all([
      page.waitForLoadState('networkidle'),
      submitButton.first().click(),
    ]);
  }

  await expect(page).toHaveURL(new RegExp(redirectPath.replace('/', '\/') + '|home|dashboard'));
}

export async function logoutViaUi(page: Page): Promise<void> {
  const menu = page.locator('button:has-text("Menu"), button:has-text("Profile"), [aria-label*="profile" i]');
  if (await menu.count()) {
    await menu.first().click();
  }

  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
  if (await logoutBtn.count()) {
    await Promise.all([
      page.waitForLoadState('networkidle'),
      logoutBtn.first().click(),
    ]);
  }
}

export async function waitForApiResponse(
  page: Page,
  opts: { method?: string; urlIncludes: string; status?: number }
): Promise<void> {
  const method = (opts.method || 'GET').toUpperCase();
  const status = opts.status || 200;
  await page.waitForResponse((response) => {
    return (
      response.request().method().toUpperCase() === method &&
      response.url().includes(opts.urlIncludes) &&
      response.status() === status
    );
  });
}
