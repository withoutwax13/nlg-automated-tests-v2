// find the indexes of the columns first since users can change the order of the columns
export const getOrderOfColumns = (
  columns: string[],
  columnCollectionAlias: string
) => {
  // Check if the alias already exists and has valid data
  if (Cypress._.has(cy.state("aliases"), columnCollectionAlias)) {
    // Alias already exists and has valid data, skip the process
    return;
  }

  // Alias does not exist or is empty, proceed with the process
  cy.wrap({}).as(`${columnCollectionAlias}`);

  cy.get("thead")
    .find("tr")
    .find("th")
    .each(($th, index) => {
      cy.get(`@${columnCollectionAlias}`).then((columnIndexes) => {
        columns.forEach((column) => {
          // Clean the text content of the current column header using regex
          const cleanedText = $th
            .text()
            .replace(/["\s]+/g, " ")
            .trim();

          if (cleanedText === column) {
            // LOG FOR DEBUG
            // cy.log(`Processing column: ${column}`);
            // cy.log(`Column index in DOM: ${index}`);

            cy.wrap({
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
