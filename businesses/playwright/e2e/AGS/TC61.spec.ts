import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessUpdate from "../../objects/BusinessUpdate";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const agsBusinessUpdatePage = new BusinessUpdate({ userType: "ags" });

test.describe("As a user, if there are no changes made in the update business page, the save button should not exist", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    agsBusinessDetails.clickEditBusinessInfoButton();
    agsBusinessUpdatePage.getElement().saveButton().should("not.exist");
    agsBusinessUpdatePage.getElement().locationDbaField().clear();
    agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    agsBusinessUpdatePage.getElement().saveButton().should("be.disabled"); // TC62 assertion
  });
});
