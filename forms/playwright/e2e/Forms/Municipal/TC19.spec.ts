import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";
import { MUNICIPAL_FORM_GRID_COLUMNS as defaultColumns } from "../../../objects/FormGrid";

test.describe("As a municipal user, I should be able to reorganize the order of the columns", () => {
  test("Initiating test", () => {
    const munincipalFormGrid = new FormGrid({
      userType: "municipal",
    });
    cy.login({ accountType: "municipal", accountIndex: 4 });

    const columnPairs = [];
    const columnsToTest = defaultColumns.slice(1, 5); // Limiting to 4 columns to save resource usage
    for (let i = 0; i < columnsToTest.length; i++) {
      for (let j = i + 1; j < columnsToTest.length; j++) {
        columnPairs.push([columnsToTest[i], columnsToTest[j]]);
      }
    }

    columnPairs.forEach(([column, targetColumn]) => {
      munincipalFormGrid.init();
      munincipalFormGrid.verifyColumnOrder(
        column,
        `${column.replace(/\s+/g, "")}IndexBeforeMove`
      );
      munincipalFormGrid.verifyColumnOrder(
        targetColumn,
        `${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`
      );
      munincipalFormGrid.clickCustomizeTableViewButton();
      munincipalFormGrid.moveColumnToLocationOf(column, targetColumn);

      munincipalFormGrid.init(true);
      munincipalFormGrid.verifyColumnOrder(
        targetColumn,
        `${targetColumn.replace(/\s+/g, "")}IndexAfterMove`
      );
      munincipalFormGrid.verifyColumnOrder(
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
      munincipalFormGrid.clickCustomizeTableViewButton();
      munincipalFormGrid.restoreDefaultGridSettings();
    });
  });
});
