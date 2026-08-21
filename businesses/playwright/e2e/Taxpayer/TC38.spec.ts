import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });
test.describe("As a taxpayer, I should be able to see required forms in my business details page", () => {
  test("As a taxpayer, I should be able to see required forms in my business details page", { tag: ["@slot-02", "@taxpayer", "@business-active"] }, async ({ page, resourceSlot }) => {
    const taxpayerBusinessDetails = new BusinessDetails(page, { userType: "taxpayer" });
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessList.init(page);
    await taxpayerBusinessList.viewBusinessDetails(resourceSlot.businesses.active);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    const formRequirements = await taxpayerBusinessDetails.getFormRequirements();
    expect(formRequirements.length).toBeGreaterThan(0);
    expect(formRequirements).toContain("Food and Beverage Tax Return (Monthly)");
  });
});
