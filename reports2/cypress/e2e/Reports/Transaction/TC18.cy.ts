import TransactionGrid from "../../../objects/TransactionGrid";
import { AGS_TRANSACTION_GRID_COLUMNS as defaultColumns } from "../../../objects/TransactionGrid";

describe(
  "As a user, I should be able to hide/show columns on the transaction list",
  { tags: ["sanity", "regression"] },
  () => {
    it.skip("Initiating test", () => {
      const transactionGrid = new TransactionGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 9 });
      defaultColumns.slice(1, 4).forEach((column) => {
        // Limiting to 4 columns to save resource usage
        transactionGrid.init();
        transactionGrid.clickCustomizeTableViewButton();
        transactionGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeHide`
        );
        transactionGrid.hideColumn(column);
        transactionGrid.init();
        transactionGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityAfterHide`
        );
        cy.get(`@${column.replace(/\s+/g, "")}VisibilityBeforeHide`).then(
          (beforeToggle) => {
            cy.get(`@${column.replace(/\s+/g, "")}VisibilityAfterHide`).then(
              (afterToggle) => {
                expect(beforeToggle).to.not.equal(afterToggle);
              }
            );
          }
        );
        transactionGrid.clickCustomizeTableViewButton();
        transactionGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeShow`
        );
        transactionGrid.showColumn(column);
        transactionGrid.init();
        transactionGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityAfterShow`
        );
        cy.get(`@${column.replace(/\s+/g, "")}VisibilityBeforeShow`).then(
          (beforeToggle) => {
            cy.get(`@${column.replace(/\s+/g, "")}VisibilityAfterShow`).then(
              (afterToggle) => {
                expect(beforeToggle).to.not.equal(afterToggle);
              }
            );
          }
        );
      });
    });
  }
);
