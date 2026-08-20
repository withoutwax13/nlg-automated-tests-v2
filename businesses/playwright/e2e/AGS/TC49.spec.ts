import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import SetBusinessStatusModal from "../../objects/SetBusinessStatusModal";
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

const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

const operatingStatus = ["Inactive", "Active/Seasonal", "Closed", "Sold"];

test.describe("As a ags user, I should be able to update operating status in the business details page", () => {
  test("Initiating test", { tag: ["@slot-08", "@ags", "@business-generated"] }, async ({ page, resourceSlot }, testInfo) => {
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const newBusinessData = {
      ...baseBusinessData,
      legalBusinessName: `Arrakis Sand Company ${identity.suffix}`,
      fein: identity.fein,
      locationDba: `Arrakis Sand Company ${identity.suffix}`,
      stateTaxId: identity.stateTaxId,
    };
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const addBusinessPage = new BusinessAdd(page, { userType: "ags" });
    const setBusinessStatusModal = new SetBusinessStatusModal(page);
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    let businessCreated = false;
    let primaryTestFailed = false;

    try {
      await Login.login(page, resourceSlot, { accountType: "ags" });
      await agsBusinessGrid.init(page);
      await agsBusinessGrid.clickAddBusinessButton();
      await addBusinessPage.fillFields(newBusinessData, page);
      await addBusinessPage.clickSaveButton();
      businessCreated = true;
      await agsBusinessGrid.init(page);
      await agsBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
      for (const status of operatingStatus) {
        if (status === "Active/Seasonal" || status === "Inactive") {
          await agsBusinessDetails.clickBusinessStatusTab();
          await agsBusinessDetails.getElement().operatingStatusDropdown().click();
          await agsBusinessDetails.getElement().anyList().filter({ hasText: status }).first().click();
          await expect(setBusinessStatusModal.getElement().modal()).toBeVisible();
          await setBusinessStatusModal.getElement().cancelButton().click();
        } else {
          await agsBusinessDetails.clickBusinessStatusTab();
          await agsBusinessDetails.getElement().operatingStatusDropdown().click();
          await agsBusinessDetails.getElement().anyList().filter({ hasText: status }).first().click();
          await expect(setBusinessStatusModal.getElement().modal()).toBeVisible();
          await setBusinessStatusModal.setBusinessCloseDate({
            month: randomMonth,
            date: randomDate,
            year: 2030
          });
          await setBusinessStatusModal.clickCloseButton();
        }
      }
    } catch (error) {
      primaryTestFailed = true;
      throw error;
    } finally {
      if (businessCreated) {
        try {
          await agsBusinessGrid.init(page);
          await agsBusinessGrid.clickClearAllFiltersButton();
          await agsBusinessGrid.deleteBusiness(newBusinessData.locationDba);
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
