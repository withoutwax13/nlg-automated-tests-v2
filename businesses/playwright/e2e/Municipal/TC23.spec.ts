import { test, expect } from "../../fixtures/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import { createBusinessTestIdentity } from "../../support/business-test-identity";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

const createNewBusinessData = (
  identity: ReturnType<typeof createBusinessTestIdentity>,
) => ({
  legalBusinessName: `Arrakis Spice Company ${identity.suffix}`,
  fein: identity.fein,
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Spice Company ${identity.suffix}`,
  stateTaxId: identity.stateTaxId,
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
});

test.describe("As a municipal user, I should be able to delete a business.", () => {
  
  test("Initiating test", { tag: ["@slot-05", "@municipal", "@business-generated"] }, async ({ page, resourceSlot }, testInfo) => {
    const addBusinessPage = new BusinessAdd(page, { userType: "municipal" });
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const newBusinessData = createNewBusinessData(identity);
    let businessCreated = false;
    let primaryTestFailed = false;

    try {
      await Login.login(page, resourceSlot, { accountType: "municipal" });
      await municipalBusinessGrid.init(page);
      await municipalBusinessGrid.clickAddBusinessButton();
      await addBusinessPage.fillFields(newBusinessData, page);
      await addBusinessPage.clickSaveButton();
      businessCreated = true;
      await municipalBusinessGrid.init(page, false, false);
      await municipalBusinessGrid.clickClearAllFiltersButton();
      await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
      await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);

      // delete business data
      await municipalBusinessGrid.init(page, false, false);
      await municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
      businessCreated = false;
      // await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    } catch (error) {
      primaryTestFailed = true;
      throw error;
    } finally {
      if (businessCreated) {
        try {
          await municipalBusinessGrid.init(page);
          await municipalBusinessGrid.clickClearAllFiltersButton();
          await municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
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
