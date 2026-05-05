import DelinquencyGrid from "../../../objects/DelinquencyGrid";

describe.skip(
  "As a municipal user, I should be able to view delinquency report.",
  { tags: ["regression"] },
  () => {
    it("Initiating test", () => {
      const municipalityDelinquencyGrid = new DelinquencyGrid({
        userType: "municipality",
      });
      cy.login({ accountType: "municipality", accountIndex: 2 });
      municipalityDelinquencyGrid.init();
      municipalityDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
    });
  }
);
