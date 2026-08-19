import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import BusinessResetModal from "../../objects/BusinessResetModal";
import BusinessAdd from "../../objects/BusinessAdd";
import { createBusinessTestIdentity } from "../../support/business-test-identity";
import Login from "../../utils/Login";

const baseBusinessData = {
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: "Paul Atreides",
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe("I should be able to reset all data of a specific municipality", () => {
  test.skip(
    process.env.E2E_RUN_GLOBAL_STATE !== "true",
    "This test resets an entire municipality and must run explicitly in a one-worker, unsharded lane."
  );

  test("Initiating test", async ({ page, resourceSlot }, testInfo) => {
    if (testInfo.config.workers !== 1 || (testInfo.config.shard?.total ?? 1) > 1) {
      throw new Error("Businesses TC32 requires --workers=1 and an unsharded Playwright run.");
    }

    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const newBusinessData = {
      ...baseBusinessData,
      legalBusinessName: `E2E Reset Business ${identity.suffix}`,
      fein: identity.fein,
      locationDba: `E2E Reset Business ${identity.suffix}`,
      stateTaxId: identity.stateTaxId,
    };
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.resetMunicipality,
    });
    const addBusinessPage = new BusinessAdd(page, { userType: "ags" });
    const businessResetModal = new BusinessResetModal(page);
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page, false, false, false);
    await agsBusinessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData, page);
    await addBusinessPage.clickSaveButton();
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickResetDataButton();
    await businessResetModal.clickSureWantToDeleteDataCheckbox();
    await businessResetModal.clickDeleteDataButton();
    await expect(agsBusinessGrid.getElement().noRecordFoundComponent()).toBeVisible();

    // TODO: Assert that all other data in the municipality has been deleted as well (e.g. registration, filings, etc.)
  });
});
