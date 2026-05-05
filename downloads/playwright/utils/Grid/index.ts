import type { Page } from "@playwright/test";

export const getOrderOfColumns = async (
  page: Page,
  columns: string[]
): Promise<Record<string, number>> => {
  const headers = page.locator("thead tr th");
  const count = await headers.count();
  const columnIndexes: Record<string, number> = {};

  for (let index = 0; index < count; index += 1) {
    const cleanedText = (await headers.nth(index).innerText())
      .replace(/["\s]+/g, " ")
      .trim();

    for (const column of columns) {
      if (cleanedText === column) {
        columnIndexes[column] = index;
      }
    }
  }

  return columnIndexes;
};

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
