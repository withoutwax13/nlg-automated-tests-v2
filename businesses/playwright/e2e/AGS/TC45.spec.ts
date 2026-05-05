import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a ags user, I should be able to update start date for delinquency tracking in the business details page", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 1 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 74829");
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");
    agsBusinessDetails.clickBusinessStatusTab();

    agsBusinessDetails.setStartDateDelinquencyTracking({
      month: randomMonth,
      date: randomDate,
      year: 2024,
    });
    agsBusinessDetails.clickSaveButton();
    agsBusinessDetails.getElement().toastComponent().should("exist");
  });
});
