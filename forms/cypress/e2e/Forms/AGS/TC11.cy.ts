import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to navigate to the form editor via open in editor button", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 4 });
    agsFormGrid.init();
    agsFormGrid.filterColumn("Draft Change Type", "Major");
    agsFormGrid.filterColumn("Status", "Draft", "multi-select");
    agsFormGrid.getDataOfColumnForNRow(1, "Form Title", "firstRowForm");
    agsFormGrid.getDataOfColumnForNRow(1, "Version", "firstRowVersion");
    agsFormGrid.clickClearAllFiltersButton();
    cy.get("@firstRowForm").then(($firstRowForm) => {
      agsFormGrid.init();
      agsFormGrid.filterColumn("Form Title", String($firstRowForm));
      agsFormGrid.filterColumn("Draft Change Type", "Major");
      agsFormGrid.filterColumn("Status", "Draft", "multi-select");
      agsFormGrid.toggleActionButton(
        "order",
        "Open in editor",
        undefined,
        undefined,
        0
      );
    });
    cy.get("@firstRowVersion").then(($firstRowVersion) => {
      cy.url().should("include", "formsApp");
      cy.url().should("include", $firstRowVersion);
    });
  });
});
