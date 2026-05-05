import { test, expect } from '../../../support/pwtest';
import SettlementGrid from "../../../objects/SettlementGrid";
import { AGS_SETTLEMENT_GRID_COLUMNS as defaultColumns } from "../../../objects/SettlementGrid";

test.describe(
  "As a user, I should be able to reorganize the order of columns on the settlement list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
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
        settlementGrid.init();
        settlementGrid.verifyColumnOrder(
          column,
          `${column.replace(/\s+/g, "")}IndexBeforeMove`
        );
        settlementGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`
        );
        settlementGrid.clickCustomizeTableViewButton();
        settlementGrid.moveColumnToLocationOf(column, targetColumn);

        settlementGrid.init(true);
        settlementGrid.verifyColumnOrder(
          targetColumn,
          `${targetColumn.replace(/\s+/g, "")}IndexAfterMove`
        );
        settlementGrid.verifyColumnOrder(
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
        settlementGrid.clickCustomizeTableViewButton();
        settlementGrid.restoreDefaultGridSettings();
      });
    });
  }
);
