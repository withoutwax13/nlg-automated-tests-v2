import { currentPage, hasAlias, setAlias, textOf } from "../../support/runtime";

const normalizeHeaderText = (value: string) =>
  value.replace(/["\s]+/g, " ").trim();

export const getOrderOfColumns = async (
  columns: string[],
  columnCollectionAlias: string,
  resetAlias = false
) => {
  if (hasAlias(columnCollectionAlias) && !resetAlias) {
    return;
  }

  const columnIndexes: Record<string, number> = {};
  const headers = currentPage().locator("thead tr th");
  const headerCount = await headers.count();

  for (let index = 0; index < headerCount; index += 1) {
    const headerText = normalizeHeaderText(await textOf(headers.nth(index)));
    for (const column of columns) {
      if (headerText === column) {
        columnIndexes[column] = index;
      }
    }
  }

  setAlias(columnCollectionAlias, columnIndexes);
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

export const getVisibilityStatusOfColumns = async (
  columns: string[],
  columnCollectionAlias: string
) => {
  if (hasAlias(columnCollectionAlias)) {
    return;
  }

  const visibilityStatus = Object.fromEntries(columns.map((column) => [column, false]));
  const headers = currentPage().locator("thead tr th");
  const headerCount = await headers.count();

  for (let index = 0; index < headerCount; index += 1) {
    const headerText = normalizeHeaderText(await textOf(headers.nth(index)));
    if (headerText in visibilityStatus) {
      visibilityStatus[headerText] = true;
    }
  }

  setAlias(columnCollectionAlias, visibilityStatus);
};
