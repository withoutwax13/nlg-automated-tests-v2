import type { Page, Locator } from "@playwright/test";
import { currentPage, setStoredValue, tryGetStoredValue } from "../../support/runtime";

const cleanHeaderText = (text: string) => text.replace(/["\s]+/g, " ").trim();

export const getOrderOfColumns = async (
  columns: string[],
  columnCollectionAlias: string
) => {
  const existing = tryGetStoredValue<Record<string, number>>(columnCollectionAlias);
  if (existing) {
    return existing;
  }

  const headers = await currentPage().locator("thead tr th").allTextContents();
  const columnIndexes = headers.reduce<Record<string, number>>((acc, headerText, index) => {
    const cleaned = cleanHeaderText(headerText);
    if (columns.includes(cleaned)) {
      acc[cleaned] = index;
    }
    return acc;
  }, {});

  return setStoredValue(columnCollectionAlias, columnIndexes);
};

export const validateFilterOperation = (
  filterType: keyof typeof validFilterOperations,
  filterOperation: string
) => {
  if (!validFilterOperations[filterType].includes(filterOperation)) {
    throw new Error(`Invalid ${filterType} filter operation: ${filterOperation}`);
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

  if (filterType === "multi-select") {
    const row = page
      .locator(".k-multicheck-wrap li")
      .filter({ hasText: filterValue })
      .first();
    await row.locator('input[type="checkbox"]').click({ force: true });
  } else {
    if (filterType === "text" || filterType === "date" || filterType === "number") {
      validateFilterOperation(filterType as "text" | "date" | "number", filterOperation);
    }

    await page.locator(".k-filter-menu-container .k-dropdownlist").click({ force: true });
    await page
      .locator(".k-list-ul li .k-list-item-text")
      .filter({ hasText: filterOperation })
      .first()
      .click({ force: true });

    if (!["Is not null", "Is null"].includes(filterOperation)) {
      if (filterType === "date") {
        const dateInput = page.locator(".k-filter-menu-container .k-dateinput input").first();
        await dateInput.fill("");
        await dateInput.type(filterValue.split("/").join("ArrowRight"), { delay: 10 });
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
