import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";
import { AGS_COLUMNS as defaultColumns } from "../../objects/BusinessGrid";

const businessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});

test.describe("As a user, I should be able to reorganize the order of the columns.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 9 });
    const columnPairs = [];
    const columnsToTest = defaultColumns.slice(2, 4); // Limiting to 2 columns to save resource usage
    for (let i = 0; i < columnsToTest.length; i++) {
      for (let j = i + 1; j < columnsToTest.length; j++) {
        columnPairs.push([columnsToTest[i], columnsToTest[j]]);
      }
    }

    columnPairs.forEach(([column, targetColumn]) => {
      businessGrid.init();
      businessGrid.verifyColumnOrder(
        column,
        `${column.replace(/\s+/g, "")}IndexBeforeMove`
      );
      businessGrid.verifyColumnOrder(
        targetColumn,
        `${targetColumn.replace(/\s+/g, "")}IndexBeforeMove`
      );
      businessGrid.clickCustomizeTableViewButton();
      businessGrid.moveColumnToLocationOf(column, targetColumn);

      businessGrid.init(true);
      businessGrid.verifyColumnOrder(
        targetColumn,
        `${targetColumn.replace(/\s+/g, "")}IndexAfterMove`
      );
      businessGrid.verifyColumnOrder(
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
      businessGrid.clickCustomizeTableViewButton();
      businessGrid.restoreDefaultGridSettings();
    });
  });
});
