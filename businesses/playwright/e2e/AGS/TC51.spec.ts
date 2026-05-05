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

test.describe("When I update the business close date, system should let the save button of the Set Business Status modal to be disabled until I select a business status", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 4 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");
    agsBusinessDetails.clickBusinessStatusTab();
    agsBusinessDetails.triggerSetBusinessStatusModal();
    agsBusinessDetails.setBusinessStatusModal.getElement().modal().should("exist");
    agsBusinessDetails.setBusinessStatusModal.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2029,
    });
    agsBusinessDetails.setBusinessStatusModal
      .getElement()
      .saveButton()
      .should("be.disabled");
  });
});
