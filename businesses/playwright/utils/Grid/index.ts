// find the indexes of the columns first since users can change the order of the columns
export const getOrderOfColumns = (
  columns: string[],
  columnCollectionAlias: string,
  resetAlias?: boolean
) => {
  // Check if the alias already exists and has valid data
  if (PW._.has(pw.state("aliases"), columnCollectionAlias)) {
    // Alias already exists and has valid data, skip the process
    if (!resetAlias) {
      return;
    }
  }

  // Alias does not exist or is empty, proceed with the process
  pw.wrap({}).as(`${columnCollectionAlias}`);

  pw.get("thead")
    .find("tr")
    .find("th")
    .each(($th, index) => {
      pw.get(`@${columnCollectionAlias}`).then((columnIndexes) => {
        columns.forEach((column) => {
          // Clean the text content of the current column header using regex
          const cleanedText = $th
            .text()
            .replace(/["\s]+/g, " ")
            .trim();

          if (cleanedText === column) {
            // LOG FOR DEBUG
            // pw.log(`Processing column: ${column}`);
            // pw.log(`Column index in DOM: ${index}`);

            pw.wrap({
              ...columnIndexes,
              [column]: index,
            }).as(`${columnCollectionAlias}`);
          }
        });
      });
    });
};

export const validateFilterOperation = (
  filterType: keyof typeof validFilterOperations,
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
    throw new Error(
      `Invalid ${filterType} filter operation: ${filterOperation}`
    );
  }
};

// find the visibility status of the columns
export const getVisibilityStatusOfColumns = (
  columns: string[],
  columnCollectionAlias: string
) => {
  // Check if the alias already exists and has valid data
  if (PW._.has(pw.state("aliases"), columnCollectionAlias)) {
    // Alias already exists and has valid data, skip the process
    return;
  }

  // Alias does not exist or is empty, proceed with the process
  pw.wrap({}).as(`${columnCollectionAlias}`);

  pw.get("thead")
    .find("tr")
    .find("th")
    .each(($th) => {
      pw.get(`@${columnCollectionAlias}`).then((columnCollection) => {
        let columnCollectionCopy = columnCollection;
        columns.forEach((column, index, _array) => {
          // Clean the text content of the current column header using regex
          const cleanedText = $th
            .text()
            .replace(/["\s]+/g, " ")
            .trim();

          if (cleanedText === column) {
            // LOG FOR DEBUG
            // console.log("Column found: ", column);
            columnCollectionCopy = {
              ...columnCollectionCopy,
              [column]: true,
            };
            pw.wrap(columnCollectionCopy).as(`${columnCollectionAlias}`);
          } else {
            if (
              index === _array.length - 1 &&
              columnCollectionCopy[column] === undefined
            ) {
              // LOG FOR DEBUG
              // console.log("Column not found: ", column);
              columnCollectionCopy = {
                ...columnCollectionCopy,
                [column]: false,
              };
              pw.wrap(columnCollectionCopy).as(`${columnCollectionAlias}`);
            }
          }
        });
      });
    });
};
