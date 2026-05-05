import { expect, Locator, Page } from "@playwright/test";
import { resolvePage } from "../pageContext";

export type AccountType = "taxpayer" | "municipal" | "ags";

export type LoginParams = {
  notFirstLogin?: boolean;
  accountType: AccountType;
  accountIndex?: number;
};

type Credentials = {
  username: string;
  password: string;
};

type ValidCredentials = Record<AccountType, Credentials[]>;

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "https://dev.azavargovapps.com";

const defaultCredentialList = (): Credentials[] => {
  const username = process.env.TEST_USERNAME || "";
  const password = process.env.TEST_PASSWORD || "";
  return Array.from({ length: 10 }, () => ({ username, password }));
};

const getCredentialsConfig = (): ValidCredentials => {
  const raw =
    process.env.validCredentials ||
    process.env.VALIDCREDENTIALS ||
    process.env.VALID_CREDENTIALS;

  if (raw) {
    try {
      return JSON.parse(raw) as ValidCredentials;
    } catch {
      // fall through to default credentials
    }
  }

  const list = defaultCredentialList();
  return {
    taxpayer: list,
    municipal: list,
    ags: list,
  };
};

const getExpectedPath = (accountType: AccountType) => {
  switch (accountType) {
    case "taxpayer":
      return "/BusinessesApp/BusinessesList";
    case "municipal":
      return "/filingApp/filingList";
    case "ags":
      return "/";
    default:
      return "/";
  }
};

export const waitForLoading = async (
  pageOrSeconds?: Page | number,
  maybeSeconds = 3
) => {
  const page =
    typeof pageOrSeconds === "object" ? pageOrSeconds : resolvePage();
  const seconds =
    typeof pageOrSeconds === "number" ? pageOrSeconds : maybeSeconds;
  await page.waitForTimeout(seconds * 1000);
};

export const maybeClick = async (locator: Locator) => {
  if (await locator.count()) {
    const candidate = locator.first();
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click();
    }
  }
};

export const login = async (params: LoginParams, page?: Page) => {
  const currentPage = resolvePage(page);
  const notFirstLogin = params.notFirstLogin ?? false;
  const accountIndex = params.accountIndex ?? 0;
  const credentials = getCredentialsConfig()[params.accountType]?.[accountIndex];

  if (!credentials) {
    throw new Error(`Missing credentials for ${params.accountType}[${accountIndex}]`);
  }

  await currentPage.goto(`${baseUrl}/login`);
  await expect(currentPage).toHaveURL(/\/login$/);

  if (!notFirstLogin) {
    await maybeClick(currentPage.locator(".cookie-actions .NLGButtonPrimary"));
  }

  await currentPage.locator('[data-cy="email-address"]').fill(credentials.username);
  await expect(currentPage.locator('[data-cy="email-address"]')).toHaveValue(credentials.username);
  await currentPage.locator('[data-cy="password"]').fill(credentials.password);
  await expect(currentPage.locator('[data-cy="password"]')).toHaveValue(credentials.password);

  await Promise.all([
    currentPage.waitForURL((url) => url.pathname === getExpectedPath(params.accountType), {
      timeout: 120000,
    }),
    currentPage.locator('[data-cy="sign-in"]').click(),
  ]);
};

export const logout = async (page?: Page) => {
  const currentPage = resolvePage(page);
  await currentPage.locator(".profileDropDownButton").last().click();
  await currentPage.getByText("Log out").click();
  await expect(currentPage).toHaveURL(/\/login$/);
};

export const checkAccessibility = async (
  _pageOrOptions?: Page | unknown,
  _options?: unknown
) => {
  // Native a11y scan wiring is not present in this project yet.
};
