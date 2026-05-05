import FormGrid from "../../../objects/FormGrid";

const municipalFormGrid = new FormGrid({ userType: "municipal" });

describe("As a municipal user, I should be able to export forms.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "municipal" });
    municipalFormGrid.init();
    municipalFormGrid.clickExportButton();
  });
});
