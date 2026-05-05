import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });
const taxpayerBusinessDetails = new BusinessDetails({ userType: "taxpayer" });

test.describe("As a taxpayer, I should be able to see required forms in my business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "taxpayer" });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
    taxpayerBusinessDetails.getFormRequirements("formRequirements");
    cy.get("@formRequirements").then((formRequirements) => {
      expect(formRequirements).to.have.length.greaterThan(0);
      expect(formRequirements).to.include(
        "Food and Beverage Tax Return (Monthly)"
      );
      // expect(formRequirements).to.include("Business License (Annual) - E2E #1");
    });
  });
});
