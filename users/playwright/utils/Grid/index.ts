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
