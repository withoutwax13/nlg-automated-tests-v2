const validFilterOperations = {
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
} as const;

type FilterType = keyof typeof validFilterOperations;

export const validateFilterOperation = (
  filterType: FilterType,
  filterOperation: string
) => {
  if (!validFilterOperations[filterType].includes(filterOperation as never)) {
    throw new Error(
      `Invalid ${String(filterType)} filter operation: ${filterOperation}`
    );
  }
};
