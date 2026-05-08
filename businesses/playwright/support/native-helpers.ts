import { expect, type Locator, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "municipality" | "ags" | "municipalDel";

export type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

type DateParts = {
  month: string | number;
  day?: string | number;
  date?: string | number;
  year: string | number;
};

const normalizeAccountType = (accountType: AccountType) =>
  accountType === "municipality" ? "municipal" : accountType;

const pad = (value: string | number) => String(value).padStart(2, "0");

export const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

export const getEnvironment = () =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;

const getCredentials = (accountType: AccountType, accountIndex = 0) => {
  const normalizedType = normalizeAccountType(accountType);
  const validCredentials = {
      taxpayer: [
        {
          username: "valerasoftwares+taxpayer.1@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      municipal: [
        {
          username: "valerasoftwares+arrakis@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      ags: [
        {
          username: "johnpatrickyusoresvalera+dev.super@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      municipalDel: [
        {
          username: "valerasoftwares+remedios@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
    }
  return {
    username: validCredentials[normalizedType][accountIndex]["username"],
    password: validCredentials[normalizedType][accountIndex]["password"],
  };
};

let activePage: Page | null = null;

export const setCurrentPage = (page: Page) => {
  activePage = page;
};

export const currentPage = () => {
  if (!activePage) {
    throw new Error("currentPage is not set. Call login(page, ...) first or setCurrentPage(page).");
  }
  return activePage;
};

export const waitForLoading = async (page?: Page, seconds = 5) => {
  const targetPage = page ?? activePage;
  if (!targetPage) {
    throw new Error("waitForLoading requires a page when no currentPage is set.");
  }
  await targetPage.waitForTimeout(seconds * 1000);
};

export const waitForResponse = async (
  page: Page,
  matcher: string | RegExp | ((response: Response) => boolean),
  action?: () => Promise<void> | void
) => {
  const predicate =
    typeof matcher === "function"
      ? matcher
      : (response: Response) =>
          typeof matcher === "string"
            ? response.url().includes(matcher)
            : matcher.test(response.url());

  const responsePromise = page.waitForResponse(predicate);
  if (action) {
    await action();
  }
  const response = await responsePromise;
  return response;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

export const buttonByText = (text: string, page: Page = currentPage()) =>
  page.locator("button").filter({ hasText: text }).first();

export const listItem = (text: string, page: Page = currentPage()) =>
  page.locator("li").filter({ hasText: text }).first();

export const fillDateInput = async (input: Locator, value: DateParts) =>
  setMaskedDateInput(input, value);

export const fixturePath = (name: string) => `playwright/fixtures/${name}`;

export const expectPathname = async (
  pageOrPathname: Page | string | RegExp,
  pathnameMaybe?: string | RegExp
) => {
  const page = typeof pageOrPathname === "string" || pageOrPathname instanceof RegExp
    ? currentPage()
    : pageOrPathname;
  const pathname = (typeof pageOrPathname === "string" || pageOrPathname instanceof RegExp)
    ? pageOrPathname
    : pathnameMaybe;

  if (!pathname) throw new Error("expectPathname requires a pathname.");

  const regex = typeof pathname === "string"
    ? new RegExp(`${pathname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
    : pathname;
  await expect(page).toHaveURL(regex);
};

export const expectCurrentUrlToInclude = async (text: string, page: Page = currentPage()) => {
  await expect(page).toHaveURL(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
};

export const logout = async (page: Page = currentPage()) => {
  await page.goto(`${getBaseUrl()}/logout`);
};

export const deleteBusinessData = async (
  _input?: string | { dba?: string; userType?: AccountType; notFirstLogin?: boolean; accountIndex?: number },
  _page: Page = currentPage()
) => {
  // Compatibility shim for legacy specs.
};

export const formatDate = ({ month, year, day, date }: DateParts) =>
  `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;

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
    if (columns.includes(text)) {
      result[text] = index;
    }
  }

  return result;
};

export const getVisibilityStatus = (columns: string[], order: Record<string, number>) =>
  Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));

export const getRowCells = (row: Locator) => row.locator("td");

export const findRowByCellValue = async (
  rows: Locator,
  columnIndex: number,
  value: string,
  exact = true
) => {
  const count = await rows.count();

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const cellText = normalizeText(await getRowCells(row).nth(columnIndex).textContent());
    if ((exact && cellText === value) || (!exact && cellText.includes(value))) {
      return row;
    }
  }

  return null;
};

export const getPagerTotal = async (pagerInfo: Locator) => {
  const text = normalizeText(await pagerInfo.textContent());
  const match = text.match(/of\s+([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};

export const login = async (page: Page, params: LoginParams = {}) => {
  setCurrentPage(page);
  const accountType = params.accountType || "taxpayer";
  const credentials = getCredentials(accountType, params.accountIndex ?? 0);

  await page.goto(`${getBaseUrl()}/login`);
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();

  await expect(page).not.toHaveURL(`${getBaseUrl()}/login`);
};
