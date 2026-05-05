import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });
const taxpayerBusinessDetails = new BusinessDetails({ userType: "taxpayer" });

test.describe("As a taxpayer, I should be able to see my business information in my business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 1 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");

    const businessFields = {
      "Business Name": "Arrakis Spice Company 13685",
      DBA: "Arrakis Spice Company 13685",
      "Location Address 1": "123 Desert Road",
      "Location Address 2": "Suite 100",
      "Location City": "Dune",
      "Location State": "AK",
      "Location Zip Code": "90210"
    };

    Object.entries(businessFields).forEach(([field, value]) => {
      taxpayerBusinessDetails.getBusinessData(field, field.replace(/\s+/g, ""));
      cy.get(`@${field.replace(/\s+/g, "")}`).then((data) => {
        expect(data).to.equal(value);
      });
    });
  });
});
