import { test, expect } from '@playwright/test';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import { AGS_DELINQUENCY_GRID_COLUMNS as defaultColumns } from "../../../objects/DelinquencyGrid";
test.describe.skip(
  "As a user, I should be able to hide/show columns on the delinquency list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const delinquencyGrid = new DelinquencyGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 9 });
      defaultColumns.slice(1, 4).forEach((column) => {
        // Limiting to 4 columns to save resource usage
        delinquencyGrid.init();
        delinquencyGrid.clickCustomizeTableViewButton();
        delinquencyGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeHide`
        );
        delinquencyGrid.hideColumn(column);
        delinquencyGrid.init();
        delinquencyGrid.verifyColumnVisibility(
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
        delinquencyGrid.clickCustomizeTableViewButton();
        delinquencyGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeShow`
        );
        delinquencyGrid.showColumn(column);
        delinquencyGrid.init();
        delinquencyGrid.verifyColumnVisibility(
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
