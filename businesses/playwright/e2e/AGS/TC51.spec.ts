import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("When I update the business close date, system should let the save button of the Set Business Status modal to be disabled until I select a business status", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "ags", accountIndex: 4 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await agsBusinessDetails.clickBusinessStatusTab();
    await agsBusinessDetails.triggerSetBusinessStatusModal();
    await expect(agsBusinessDetails.setBusinessStatusModal.getElement().modal()).toBeVisible();
    await agsBusinessDetails.setBusinessStatusModal.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2029,
    });
    await expect(agsBusinessDetails.setBusinessStatusModal.getElement().saveButton()).toBeDisabled();
  });
});