import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import SetBusinessStatusModal from "../../objects/SetBusinessStatusModal";
import Login from "../../utils/Login";

const addBusinessPage = new BusinessAdd({ userType: "ags" });
const setBusinessStatusModal = new SetBusinessStatusModal();
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomSeed = Math.floor(Math.random() * 100000);
const newBusinessData = {
  legalBusinessName: `Arrakis Sand Company ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Sand Company ${randomSeed}`,
  stateTaxId: "ST-9876543",
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

const addBusiness = async () => {
  await agsBusinessGrid.init();
  await agsBusinessGrid.clickAddBusinessButton();
  await addBusinessPage.fillFields(newBusinessData);
  await addBusinessPage.clickSaveButton();
};

const operatingStatus = ["Inactive", "Active/Seasonal", "Closed", "Sold"];

test.describe("As a ags user, I should be able to update operating status in the business details page", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags" });
    await agsBusinessGrid.init();
    await addBusiness();
    await agsBusinessGrid.init();
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
        await setBusinessStatusModal.clickCloseButton();
      }
    }
  });
});