import { expect, Locator, Page } from "@playwright/test";

export type ColumnMap = Record<string, number>;

const normalizeText = (value: string) => value.replace(/["\s]+/g, " ").trim();

export const getOrderOfColumns = async (
  columns: string[],
  headerLocator: Locator
): Promise<ColumnMap> => {
  const map: ColumnMap = {};
  const count = await headerLocator.count();

  for (let index = 0; index < count; index += 1) {
    const text = normalizeText(await headerLocator.nth(index).innerText());
    if (columns.includes(text)) {
      map[text] = index;
    }
  }

  return map;
};

export const getColumnOrder = async (
  columns: string[],
  headerLocator: Locator
): Promise<ColumnMap> => getOrderOfColumns(columns, headerLocator);

export const validateFilterOperation = (
  filterType: keyof typeof validFilterOperations,
  filterOperation: string
) => {
  if (!validFilterOperations[filterType].includes(filterOperation)) {
    throw new Error(
      `Invalid ${filterType} filter operation: ${filterOperation}`
    );
  }
};

const validFilterOperations: Record<string, string[]> = {
  text: [
    "Contains",
    "Is equal to",
    "Starts with",
    "Ends with",
    "Is null",
    "Is not null",
  ],
  date: [
    "Is equal to",
    "Is after or equal to",
    "Is after",
    "Is before",
    "Is before or equal to",
  ],
  number: [
    "Is equal to",
    "Is greater than",
    "Is greater than or equal to",
    "Is less than",
    "Is less than or equal to",
  ],
};

export const waitForFilterMenu = async (page: Page) => {
  await expect(page.locator(".k-filter-menu-container")).toBeVisible();
};

export const applyGridFilter = async ({
  page,
  filterButton,
  filterType,
  filterValue,
  filterOperation,
}: {
  page: Page;
  filterButton: Locator;
  filterType: string;
  filterValue: string;
  filterOperation: string;
}) => {
  await filterButton.click({ force: true });
  await waitForFilterMenu(page);

  if (filterType === "multi-select") {
    const row = page
      .locator(".k-multicheck-wrap li")
      .filter({ hasText: filterValue })
      .first();
    await row.locator('input[type="checkbox"]').click({ force: true });
  } else {
    if (filterType === "text" || filterType === "date" || filterType === "number") {
      validateFilterOperation(filterType, filterOperation);
    }

    await page.locator(".k-filter-menu-container .k-dropdownlist").click({ force: true });
    await page
      .locator(".k-list-ul li .k-list-item-text")
      .filter({ hasText: filterOperation })
      .first()
      .click({ force: true });

    if (!["Is not null", "Is null"].includes(filterOperation)) {
      if (filterType === "date") {
        await page
          .locator(".k-filter-menu-container .k-dateinput input")
          .first()
          .fill("");
        await page
          .locator(".k-filter-menu-container .k-dateinput input")
          .first()
          .type(filterValue.split("/").join("ArrowRight"), { delay: 10 });
      } else {
        await page.locator(".k-filter-menu-container .k-input").fill(filterValue);
      }
    }
  }

  await page
    .locator(".k-filter-menu-container .k-actions .k-button")
    .filter({ hasText: "Filter" })
    .click({ force: true });
};

export const getColumnTexts = async (
  rows: Locator,
  columnIndex: number
): Promise<string[]> => {
  const count = await rows.count();
  const values: string[] = [];

  for (let index = 0; index < count; index += 1) {
    values.push(
      normalizeText(await rows.nth(index).locator("td").nth(columnIndex).innerText())
    );
  }

  return values;
};

export const getRowByCellText = async (
  rows: Locator,
  columnIndex: number,
  wanted: string
): Promise<Locator> => {
  const count = await rows.count();

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const value = normalizeText(await row.locator("td").nth(columnIndex).innerText());
    if (value === wanted) {
      return row;
    }
  }

  throw new Error(`Row not found for value "${wanted}"`);
};

export const normalizeCellText = normalizeText;
