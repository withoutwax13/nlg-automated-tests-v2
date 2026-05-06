import { expect, Locator, Page } from "@playwright/test";
import fs from "fs";
import path from "path";

type AliasValue = unknown;

type LoginParams = {
  notFirstLogin?: boolean;
  accountType: "taxpayer" | "municipal" | "ags";
  accountIndex?: number;
};

type AccountCredential = {
  username: string;
  password: string;
};

type AccountsFixture = Record<string, AccountCredential[]>;

const parseEnvCredentials = (): AccountsFixture | undefined => {
  const raw = process.env.validCredentials || process.env.VALIDCREDENTIALS || process.env.VALID_CREDENTIALS;
  if (!raw) return undefined;
  try { return JSON.parse(raw) as AccountsFixture; } catch { return undefined; }
};

let activePage: Page | null = null;
let activeBaseUrl = "";
const aliases = new Map<string, AliasValue>();
const popupWindows = new Map<string, { called: boolean; url?: string }>();

const readFixtureData = () => {
  const fixturePath = path.resolve(
    __dirname,
    "..",
    "fixtures",
    "data.json"
  );
  if (!fs.existsSync(fixturePath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  } catch {
    return undefined;
  }
};

const getAccountsFixture = (): AccountsFixture | undefined => {
  const fixtureData = readFixtureData();
  return (fixtureData?.accounts as AccountsFixture | undefined) ??
    (fixtureData?.validCredentials as AccountsFixture | undefined) ??
    parseEnvCredentials();
};

const getPageOrThrow = () => {
  if (!activePage) {
    throw new Error("Playwright runtime has not been initialized for this test.");
  }
  return activePage;
};

const normalizeUrl = (target: string) => {
  if (/^https?:\/\//.test(target)) {
    return target;
  }
  return new URL(target, activeBaseUrl).toString();
};

const resolveCredentials = (
  accountType: LoginParams["accountType"],
  accountIndex: number
): AccountCredential => {
  const accountsFixture = getAccountsFixture();
  const fromFixture = accountsFixture?.[accountType]?.[accountIndex];
  if (fromFixture) {
    return fromFixture;
  }

  const prefix = accountType.toUpperCase();
  return {
    username:
      process.env[`${prefix}_USERNAME`] ??
      process.env.TEST_USERNAME ??
      "",
    password:
      process.env[`${prefix}_PASSWORD`] ??
      process.env.TEST_PASSWORD ??
      "",
  };
};

export const initTestRuntime = async ({
  page,
  baseURL,
}: {
  page: Page;
  baseURL?: string;
}) => {
  activePage = page;
  activeBaseUrl = baseURL ?? "";
  aliases.clear();
  popupWindows.clear();
};

export const currentPage = () => getPageOrThrow();

export const visit = async (target: string) => {
  await currentPage().goto(normalizeUrl(target));
};

export const waitForLoading = async (seconds = 5) => {
  const page = currentPage();
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await page.waitForTimeout(seconds * 1000);
};

export const setAlias = <T>(name: string, value: T) => {
  aliases.set(name, value);
};

export const getAlias = <T>(name: string) => aliases.get(name) as T;

export const hasAlias = (name: string) => aliases.has(name);

export const textOf = async (locator: Locator) =>
  ((await locator.first().textContent()) ?? "").trim();

export const attrOf = async (locator: Locator, attribute: string) =>
  locator.first().getAttribute(attribute);

export const nextSibling = (locator: Locator) =>
  locator.first().locator("xpath=following-sibling::*[1]");

export const parentOf = (locator: Locator) =>
  locator.first().locator("xpath=..");

export const withText = (locator: Locator, value: string | RegExp) =>
  locator.filter({ hasText: value }).first();

export const typeSpecial = async (locator: Locator, value: string) => {
  const input = locator.first();
  const hasDirectionalTokens = /\{(?:rightarrow|leftarrow|uparrow|downarrow)\}/.test(
    value
  );

  await input.fill("");
  if (!hasDirectionalTokens) {
    await input.type(value);
    return;
  }

  const parts = value
    .split(/(\{(?:rightarrow|leftarrow|uparrow|downarrow)\})/g)
    .filter(Boolean);

  for (const part of parts) {
    if (part === "{rightarrow}") {
      await input.press("ArrowRight");
    } else if (part === "{leftarrow}") {
      await input.press("ArrowLeft");
    } else if (part === "{uparrow}") {
      await input.press("ArrowUp");
    } else if (part === "{downarrow}") {
      await input.press("ArrowDown");
    } else {
      await input.type(part);
    }
  }
};

export const collectTexts = async (locator: Locator) => {
  const values = await locator.evaluateAll((elements) =>
    elements.map((element) => (element.textContent ?? "").trim())
  );
  return values.filter((value) => value.length > 0);
};

export const login = async ({
  notFirstLogin = false,
  accountType,
  accountIndex = 0,
}: LoginParams) => {
  const page = currentPage();
  const credentials = resolveCredentials(accountType, accountIndex);
  const loginUrl = normalizeUrl("/login");

  await page.goto(loginUrl);
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (!notFirstLogin && (await cookieButton.count()) > 0) {
    await cookieButton.click({ force: true }).catch(() => undefined);
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(
    credentials.username
  );
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(
    credentials.password
  );
  await page.locator('[data-cy="sign-in"]').first().click({ force: true });

  if (accountType === "taxpayer") {
    await page.waitForURL(/\/BusinessesApp\/BusinessesList/);
  } else if (accountType === "municipal") {
    await page.waitForURL(/\/filingApp\/filingList/);
  } else {
    await page.waitForURL(/https?:\/\/[^/]+\/($|[#?])/);
  }
};

export const logout = async () => {
  const page = currentPage();
  await page.locator(".profileDropDownButton").last().click({ force: true });
  await page.getByText("Log out", { exact: false }).first().click({
    force: true,
  });
  await expect(page).toHaveURL(/\/login$/);
};

export const stubNewWindow = async (aliasName: string) => {
  const page = currentPage();
  popupWindows.set(aliasName, { called: false });
  const callbackName = `__codexWindowOpen_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;

  await page.exposeFunction(callbackName, (url: string) => {
    popupWindows.set(aliasName, { called: true, url });
  });

  await page.evaluate((name) => {
    const callback = (window as unknown as Record<string, (...args: unknown[]) => void>)[
      name
    ];
    window.open = ((url?: string | URL) => {
      const nextUrl = String(url ?? "");
      callback(nextUrl);
      window.location.href = nextUrl;
      return null;
    }) as typeof window.open;
  }, callbackName);
};

export const wasStubCalled = (aliasName: string) =>
  popupWindows.get(aliasName)?.called ?? false;

export const stubbedWindowUrl = (aliasName: string) =>
  popupWindows.get(aliasName)?.url;
