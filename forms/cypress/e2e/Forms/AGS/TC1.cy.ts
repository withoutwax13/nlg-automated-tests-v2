import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to export forms.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags" });
    agsFormGrid.init();
    agsFormGrid.clickExportButton();
  });
});
