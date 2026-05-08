import { expect, type Locator, type Page } from "@playwright/test";
export * from "../support/native-helpers";

let activePage: Page | null = null;
export const setCurrentPage = (page: Page) => { activePage = page; };
export const currentPage = () => {
  if (!activePage) throw new Error("currentPage is not set. Call setCurrentPage(page) first.");
  return activePage;
};

export const buttonByText = (text: string, page: Page = currentPage()) =>
  page.locator("button").filter({ hasText: text }).first();

export const listItem = (text: string, page: Page = currentPage()) =>
  page.locator("li").filter({ hasText: text }).first();

export const fillDateInput = async (input: Locator, value: { month: string|number; day?: string|number; date?: string|number; year: string|number }) => {
  const pad = (v: string|number) => String(v).padStart(2, "0");
  await input.click();
  await input.fill(`${pad(value.month)}/${pad(value.day ?? value.date ?? "")}/${String(value.year)}`);
  await input.press("Tab");
};

export const fixturePath = (name: string) => `playwright/fixtures/${name}`;

export const expectPathname = async (
  pageOrPathname: Page | string | RegExp,
  pathnameMaybe?: string | RegExp
) => {
  const page = typeof pageOrPathname === "string" || pageOrPathname instanceof RegExp ? currentPage() : pageOrPathname;
  const pathname = (typeof pageOrPathname === "string" || pageOrPathname instanceof RegExp) ? pageOrPathname : pathnameMaybe;
  if (!pathname) throw new Error("expectPathname requires a pathname.");
  const regex = typeof pathname === "string" ? new RegExp(`${pathname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) : pathname;
  await expect(page).toHaveURL(regex);
};

export const expectCurrentUrlToInclude = async (text: string, page: Page = currentPage()) => {
  await expect(page).toHaveURL(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
};

export const logout = async (page: Page = currentPage()) => {
  const env = process.env.environment || process.env.ENVIRONMENT || "dev";
  await page.goto(`https://${env}.azavargovapps.com/logout`);
};

export type LoginParams = { accountType?: "taxpayer"|"municipal"|"municipality"|"ags"|"municipalDel"; accountIndex?: number; notFirstLogin?: boolean };
export const waitForLoading = async (page?: Page, seconds = 5) => {
  const targetPage = page ?? currentPage();
  await targetPage.waitForTimeout(seconds * 1000);
};

export const deleteBusinessData = async (_input?: string | { dba?: string; userType?: string; notFirstLogin?: boolean; accountIndex?: number }, _page: Page = currentPage()) => {};
