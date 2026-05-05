import { test, expect } from '@playwright/test';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import { AGS_DELINQUENCY_GRID_COLUMNS as defaultColumns } from "../../../objects/DelinquencyGrid";

test.describe.skip(
  "As a user, I should be able to reorganize the order of columns on the delinquency list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const delinquencyGrid = new DelinquencyGrid({
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
        delinquencyGrid.init();
        delinquencyGrid.verifyColumnOrder(
          column,
          `${column.replace(/\s+/g, "")}IndexBeforeMove`
        );
        delinquencyGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`
        );
        delinquencyGrid.clickCustomizeTableViewButton();
        delinquencyGrid.moveColumnToLocationOf(column, targetColumn);

        delinquencyGrid.init(true);
        delinquencyGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexAfterMove`
        );
        delinquencyGrid.verifyColumnOrder(
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
        delinquencyGrid.clickCustomizeTableViewButton();
        delinquencyGrid.restoreDefaultGridSettings();
      });
    });
  }
);
