import { test, expect } from '../../../support/pwtest';
import TransactionGrid from "../../../objects/TransactionGrid";
import { AGS_TRANSACTION_GRID_COLUMNS as defaultColumns } from "../../../objects/TransactionGrid";

test.describe(
  "As a user, I should be able to reorganize the order of columns on the transaction list",
  { tags: ["sanity", "regression"] },
  () => {
    test.skip("Initiating test", () => {
      const transactionGrid = new TransactionGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 9 });

      const columnPairs = [];
      const columnsToTest = defaultColumns.slice(1, 4); // Limiting to 4 columns to save resource usage
      for (let i = 0; i < columnsToTest.length; i++) {
        for (let j = i + 1; j < columnsToTest.length; j++) {
          columnPairs.push([columnsToTest[i], columnsToTest[j]]);
        }
      }

      columnPairs.forEach(([column, targetColumn]) => {
        transactionGrid.init();
        transactionGrid.verifyColumnOrder(
          column,
          `${column.replace(/\s+/g, "")}IndexBeforeMove`
        );
        transactionGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`
        );
        transactionGrid.clickCustomizeTableViewButton();
        transactionGrid.moveColumnToLocationOf(column, targetColumn);

        transactionGrid.init(true);
        transactionGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexAfterMove`
        );
        transactionGrid.verifyColumnOrder(
          column,
          `${column.replace(/\s+/g, "")}IndexAfterMove`
        );
        cy.get(`@${column.replace(/\s+/g, "")}IndexBeforeMove`).then(
          (beforeMove) => {
            cy.get(`@${column.replace(/\s+/g, "")}IndexAfterMove`).then(
              (afterMove) => {
                expect(beforeMove).to.not.equal(afterMove);
              }
            );
          }
        );
        cy.get(`@${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`).then(
          (beforeMove) => {
            cy.get(`@${targetColumn.replace(/\s+/g, "")}IndexAfterMove`).then(
              (afterMove) => {
                expect(beforeMove).to.not.equal(afterMove);
              }
            );
          }
        );
        transactionGrid.clickCustomizeTableViewButton();
        transactionGrid.restoreDefaultGridSettings();
      });
    });
  }
);
