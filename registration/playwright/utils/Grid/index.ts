import type { Locator } from "@playwright/test";

export const normalizeCellText = (value: string | null | undefined): string =>
  (value || "").replace(/\s+/g, " ").trim();

export const getOrderOfColumns = async (columns: Locator) => {
  const values = await columns.evaluateAll((elements) =>
    elements.map((element, index) => [
      (element.textContent || "").replace(/\s+/g, " ").trim(),
      index,
    ])
  );

  return Object.fromEntries(values.filter(([name]) => Boolean(name)));
};

export const validateFilterOperation = (
  filterType: "text" | "date" | "number",
  filterOperation: string
) => {
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

  if (!validFilterOperations[filterType].includes(filterOperation)) {
    throw new Error(`Invalid ${filterType} filter operation: ${filterOperation}`);
  }
};
