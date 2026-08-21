import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
test.describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  test("As a taxpayer user, I should be able to view business details.", async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessList.init(page);
    await taxpayerBusinessList.viewBusinessDetails(resourceSlot.businesses.active);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
  });
});
