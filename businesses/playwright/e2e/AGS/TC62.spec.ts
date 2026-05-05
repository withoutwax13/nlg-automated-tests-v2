import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessUpdate from "../../objects/BusinessUpdate";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const agsBusinessUpdatePage = new BusinessUpdate({ userType: "ags" });

test.describe("As a user, if I clear the required fields in the update business page, the save button should remain disabled", () => {
  // Skipped, assertion moved to TC61
  test.skip("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 2 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickEditBusinessInfoButton();
    agsBusinessUpdatePage.getElement().locationDbaField().clear();
    agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    agsBusinessUpdatePage.getElement().saveButton().should("be.disabled");
  });
});
