import { test, expect } from '../../../support/pwtest';
import SettlementGrid from "../../../objects/SettlementGrid";
import { AGS_SETTLEMENT_GRID_COLUMNS as defaultColumns } from "../../../objects/SettlementGrid";

test.describe(
  "As a user, I should be able to hide/show columns on the settlement list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 9 });
      defaultColumns.slice(1, 4).forEach((column) => {
        // Limiting to 4 columns to save resource usage
        settlementGrid.init();
        settlementGrid.clickCustomizeTableViewButton();
        settlementGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeHide`
        );
        settlementGrid.hideColumn(column);
        settlementGrid.init();
        settlementGrid.verifyColumnVisibility(
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
        settlementGrid.clickCustomizeTableViewButton();
        settlementGrid.verifyColumnVisibility(
          column,
          `${column.replace(/\s+/g, "")}VisibilityBeforeShow`
        );
        settlementGrid.showColumn(column);
        settlementGrid.init();
        settlementGrid.verifyColumnVisibility(
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
