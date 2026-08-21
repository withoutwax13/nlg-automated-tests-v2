import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, when the business is active, I should be able to update form submission requirements in the business details page", () => {
  test("As a user, when the business is active, I should be able to update form submission requirements in the business details page", { tag: ["@slot-03", "@ags", "@business-active"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    const forms = agsBusinessDetails.getElement().formsSectionFormList();
    const count = await forms.count();
    for (let index = 0; index < count; index += 1) {
      await expect(forms.nth(index).locator("input").first()).toBeEnabled();
    }
  });
});
