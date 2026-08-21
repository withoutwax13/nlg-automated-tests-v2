import { test, expect } from "../../fixtures/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
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

test.describe("As an AGS user, I should be able to delete a business.", () => {
  
  test("As an AGS user, I should be able to delete a business.", { tag: ["@slot-06", "@ags", "@business-generated"] }, async ({ page, resourceSlot }, testInfo) => {
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const newBusinessData = {
      ...baseBusinessData,
      legalBusinessName: `Arrakis Spice Company ${identity.suffix}`,
      fein: identity.fein,
      locationDba: `Arrakis Spice Company ${identity.suffix}`,
      stateTaxId: identity.stateTaxId,
    };
    const businessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const addBusinessPage = new BusinessAdd(page, { userType: "ags" });
    let businessCreated = false;
    let primaryTestFailed = false;

    try {
      await Login.login(page, resourceSlot, { accountType: "ags" });
      await businessGrid.init(page);
      await businessGrid.clickAddBusinessButton();
      await addBusinessPage.fillFields(newBusinessData, page);
      await addBusinessPage.clickSaveButton();
      businessCreated = true;
      await businessGrid.init(page, false, false);
      await businessGrid.clickClearAllFiltersButton();
      await businessGrid.viewBusinessDetails(newBusinessData.locationDba);
      await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);

      await businessGrid.init(page);
      await businessGrid.clickClearAllFiltersButton();
      await businessGrid.deleteBusiness(newBusinessData.locationDba);
      businessCreated = false;
    } catch (error) {
      primaryTestFailed = true;
      throw error;
    } finally {
      if (businessCreated) {
        try {
          await businessGrid.init(page);
          await businessGrid.clickClearAllFiltersButton();
          await businessGrid.deleteBusiness(newBusinessData.locationDba);
          businessCreated = false;
        } catch (cleanupError) {
          if (!primaryTestFailed) {
            throw cleanupError;
          }
          console.error("Generated business cleanup also failed after the primary test failure.");
        }
      }
    }
  });
});
