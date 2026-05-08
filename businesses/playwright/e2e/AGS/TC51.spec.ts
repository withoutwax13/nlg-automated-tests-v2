import { test, expect } from "@playwright/test";
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
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 4 });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await expect(page).toHaveURL(new RegExp(String("/BusinessesApp/BusinessDetails/")));
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