import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import SetBusinessStatusModal from "../../objects/SetBusinessStatusModal";
import { createBusinessTestIdentity } from "../../support/business-test-identity";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal",
});
const createNewBusinessData = (
  identity: ReturnType<typeof createBusinessTestIdentity>,
) => ({
  legalBusinessName: `Arrakis Sand Company ${identity.suffix}`,
  fein: identity.fein,
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Sand Company ${identity.suffix}`,
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

const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

const operatingStatus = [
  "Inactive",
  "Active/Seasonal",
  "Closed",
  "Sold",
];

test.describe("As a municipal user, I should be able to update operating status in the business details page", () => {
  test("Initiating test", { tag: ["@slot-07", "@municipal", "@business-generated"] }, async ({ page, resourceSlot }, testInfo) => {
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    const setBusinessStatusModal = new SetBusinessStatusModal(page);
    const identity = createBusinessTestIdentity(resourceSlot.id, testInfo);
    const newBusinessData = createNewBusinessData(identity);
    const addBusiness = async () => {
      const addBusinessPage = new BusinessAdd(page, { userType: "municipal" });
      await municipalBusinessGrid.init(page);
      await municipalBusinessGrid.clickAddBusinessButton();
      await addBusinessPage.fillFields(newBusinessData, page);
      await addBusinessPage.clickSaveButton();
    };
    let businessCreated = false;
    let primaryTestFailed = false;

    try {
      await Login.login(page, resourceSlot, { accountType: "municipal" });
      await municipalBusinessGrid.init(page);
      await addBusiness();
      businessCreated = true;
      await municipalBusinessGrid.init(page);
      await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
      for (const status of operatingStatus) {
        if (status === "Active/Seasonal" || status === "Inactive") {
          await municipalBusinessDetails.clickBusinessStatusTab();
          await municipalBusinessDetails.getElement().operatingStatusDropdown().click();
          await municipalBusinessDetails.getElement().anyList().filter({ hasText: status }).first().click();
          await expect(setBusinessStatusModal.getElement().modal()).toBeVisible();
          await setBusinessStatusModal.getElement().cancelButton().click();
        } else {
          await municipalBusinessDetails.clickBusinessStatusTab();
          await municipalBusinessDetails.getElement().operatingStatusDropdown().click();
          await municipalBusinessDetails.getElement().anyList().filter({ hasText: status }).first().click();
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
