import BusinessGrid from "../../objects/BusinessGrid";
import { AGS_COLUMNS as defaultColumns } from "../../objects/BusinessGrid";

const businessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});

describe("As a user, I should be able to hide/show columns", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 9 });
    defaultColumns.slice(2, 4).forEach((column) => {
      businessGrid.init();
      businessGrid.clickCustomizeTableViewButton();
      businessGrid.verifyColumnVisibility(
        column,
        `${column.replace(/\s+/g, "")}VisibilityBeforeHide`
      );
      businessGrid.hideColumn(column);
      businessGrid.init();
      businessGrid.verifyColumnVisibility(
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
      businessGrid.clickCustomizeTableViewButton();
      businessGrid.verifyColumnVisibility(
        column,
        `${column.replace(/\s+/g, "")}VisibilityBeforeShow`
      );
      businessGrid.showColumn(column);
      businessGrid.init();
      businessGrid.verifyColumnVisibility(
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
});
