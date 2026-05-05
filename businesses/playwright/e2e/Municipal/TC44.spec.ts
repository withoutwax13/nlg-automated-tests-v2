import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a municipal user, I should be able to update start date for delinquency tracking in the business details page", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "municipal", accountIndex: 1 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");
    municipalBusinessDetails.clickBusinessStatusTab();

    municipalBusinessDetails.setStartDateDelinquencyTracking({
      month: randomMonth,
      date: randomDate,
      year: 2024,
    });
    municipalBusinessDetails.clickSaveButton();
    municipalBusinessDetails.getElement().toastComponent().should("exist");
  });
});
