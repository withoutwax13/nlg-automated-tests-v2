import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("When I update the business close date, system should let the save button of the Set Business Status modal to be disabled until I select a business status", () => {
  test("When I update the business close date, system should let the save button of the Set Business Status modal to be disabled until I select a business status", { tag: ["@slot-05", "@ags", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.inactive);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await agsBusinessDetails.clickBusinessStatusTab();
    await agsBusinessDetails.triggerSetBusinessStatusModal();
    await expect(agsBusinessDetails.setBusinessStatusModal.getElement().modal()).toBeVisible();
    await agsBusinessDetails.setBusinessStatusModal.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2030,
    });
    await expect(agsBusinessDetails.setBusinessStatusModal.getElement().saveButton()).toBeDisabled();
  });
});
