import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer, I should be able to see my business information in my business details page", () => {
  test("Initiating test", { tag: ["@slot-03", "@taxpayer", "@business-active"] }, async ({ page, resourceSlot }) => {
    const taxpayerBusinessDetails = new BusinessDetails(page, { userType: "taxpayer" });
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessList.init(page);
    await taxpayerBusinessList.viewBusinessDetails(resourceSlot.businesses.active);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);

    const businessFields = {
      "Business Name": resourceSlot.businesses.active,
      DBA: resourceSlot.businesses.active,
      "Location Address 1": "123 Desert Road",
      "Location Address 2": "Suite 100",
      "Location City": "Dune",
      "Location State": "AK",
      "Location Zip Code": "90210"
    };

    for (const [field, value] of Object.entries(businessFields)) {
      const data = await taxpayerBusinessDetails.getBusinessData(field);
      expect(data).toEqual(value);
    }
  });
});
