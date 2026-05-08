import { test, expect } from "@playwright/test";
import { expectCurrentUrlToInclude } from "../../helpers/legacy-helpers";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("When I update the business close date, system should show me the Set Business Status modal", () => {
  // Reason for skipping: This can be already covered in TC51 by adding an assertion to check if the Set Business Status modal is triggered after updating the business close date.
  test.skip("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 3 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await agsBusinessDetails.clickBusinessStatusTab();
    await agsBusinessDetails.triggerSetBusinessStatusModal();
    await expect(agsBusinessDetails.setBusinessStatusModal.getElement().modal()).toBeVisible();
  });
});