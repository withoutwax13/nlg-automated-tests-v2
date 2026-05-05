import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to navigate to the form editor via create new form button", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 3 });
    agsFormGrid.init();
    agsFormGrid.clickAddNeWFormButton();
    cy.url().should("include", "createNewForm");
  });
});
