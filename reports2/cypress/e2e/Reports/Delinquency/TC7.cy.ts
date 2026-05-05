import DelinquencyGrid from "../../../objects/DelinquencyGrid";

describe(
  "As a taxpayer, I should be able to submit a filing via delinquency list action button",
  { tags: ["sanity", "regression"] },
  () => {
    it("Initiating test", () => {
      cy.intercept("GET", "https://**.azavargovapps.com/forms/municipality/**").as(
        "getFilingForm"
      );
      const taxpayerDelinquencyGrid = new DelinquencyGrid({
        userType: "taxpayer",
      });
      cy.login({ accountType: "taxpayer" });
      taxpayerDelinquencyGrid.init();
      taxpayerDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
      taxpayerDelinquencyGrid.toggleActionButtonForNthDelinquencyItem(
        "Submit Now",
        1
      );
      cy.get("@getFilingForm").its("response.statusCode").should("eq", 200);
    });
  }
);
