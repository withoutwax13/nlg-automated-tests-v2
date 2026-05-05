import { MUNICIPAL_FORM_GRID_COLUMNS as defaultColumns } from "../../../objects/FormGrid";
import FormGrid from "../../../objects/FormGrid";

describe("As a municipal user, I should be able to hide/show columns in the form list", () => {
  it("Initiating test", () => {
    const municipalityFormGrid = new FormGrid({
      userType: "municipal",
    });
    cy.login({ accountType: "municipal", accountIndex: 3 });
    defaultColumns.slice(1, 3).forEach((column) => {
      // Limiting to 2 columns to save resource usage
      municipalityFormGrid.init();
      municipalityFormGrid.clickCustomizeTableViewButton();
      municipalityFormGrid.verifyColumnVisibility(
        column,
        `${column.replace(/\s+/g, "")}VisibilityBeforeHide`
      );
      municipalityFormGrid.hideColumn(column);
      municipalityFormGrid.init();
      municipalityFormGrid.verifyColumnVisibility(
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
      municipalityFormGrid.clickCustomizeTableViewButton();
      municipalityFormGrid.verifyColumnVisibility(
        column,
        `${column.replace(/\s+/g, "")}VisibilityBeforeShow`
      );
      municipalityFormGrid.showColumn(column);
      municipalityFormGrid.init();
      municipalityFormGrid.verifyColumnVisibility(
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
