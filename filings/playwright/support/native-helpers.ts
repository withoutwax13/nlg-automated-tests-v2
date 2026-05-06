import { expect, type Locator, type Page, type Response } from "@playwright/test";
import { login as runtimeLogin } from "../utils/runtime";
export * from "../utils/runtime";

export const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

export const getEnvironment = () =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;

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
  if (action) await action();
  return responsePromise;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

type DateParts = { month: string | number; day?: string | number; date?: string | number; year: string | number };
const pad = (value: string | number) => String(value).padStart(2, "0");

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
    if (columns.includes(text)) result[text] = index;
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
    if ((exact && cellText === value) || (!exact && cellText.includes(value))) return row;
  }
  return null;
};

export const getPagerTotal = async (pagerInfo: Locator) => {
  const text = normalizeText(await pagerInfo.textContent());
  const match = text.match(/of\s+([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};
