import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, when the business is not active, I should not be able to update form submission requirements in the business details page", () => {
  test("Initiating test", { tag: ["@slot-03", "@ags", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.inactive);
    const forms = agsBusinessDetails.getElement().formsSectionFormList();
    const count = await forms.count();
    for (let index = 0; index < count; index += 1) {
      await expect(forms.nth(index).locator(".k-switch").first()).toHaveAttribute("aria-disabled", "true");
    }
  });
});
