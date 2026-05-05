import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a municipal user, I should be able to update business close date date in the business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 2 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
    municipalBusinessDetails.clickBusinessStatusTab();
    municipalBusinessDetails.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2029,
    }, false);
    municipalBusinessDetails.clickSaveButton();
    municipalBusinessDetails.getElement().toastComponent().should("exist");
  });
});
