import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import { createBusinessTestIdentity } from "../../support/business-test-identity";
import Login from "../../utils/Login";

test.describe("As a ags user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", { tag: ["@slot-08", "@ags", "@business-active"] }, async ({ page, resourceSlot }, testInfo) => {
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await agsBusinessDetails.clickDocumentsTab();
    await agsBusinessDetails.uploadDocument(`${identity.suffix}-example.json`);
  });
});
