import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As an AGS, Gov user, I want the system to prevent deleting a business record with filings", () => {
  test("As an AGS, Gov user, I want the system to prevent deleting a business record with filings", { tag: ["@slot-04", "@ags", "@business-filings"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.deleteBusiness(resourceSlot.businesses.filings, 400);
    await expect(agsBusinessGrid.getElement().noRecordFoundComponent()).not.toBeVisible();
  });
});
