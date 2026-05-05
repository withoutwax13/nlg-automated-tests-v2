import DelinquencyGrid from "../../../objects/DelinquencyGrid";

describe(
  "As a Municipal user, I should be able to export the delinquency list",
  { tags: ["sanity", "regression"] },
  () => {
    it("Initiating test", () => {
      const delinquencyGrid = new DelinquencyGrid({
        userType: "municipal",
      });
      cy.login({ accountType: "municipal" });
      delinquencyGrid.init();
      delinquencyGrid.getElement().exportButton().should("be.visible");
      delinquencyGrid.getElement().exportButton().should("not.be.disabled");
      delinquencyGrid.clickExportButton();
      delinquencyGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
