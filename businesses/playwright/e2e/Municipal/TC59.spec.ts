import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import { createBusinessTestIdentity } from "../../support/business-test-identity";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", { tag: ["@slot-07", "@municipal", "@business-active"] }, async ({ page, resourceSlot }, testInfo) => {
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await municipalBusinessDetails.clickDocumentsTab();
    await municipalBusinessDetails.uploadDocument(`${identity.suffix}-example.json`);
  });
});
