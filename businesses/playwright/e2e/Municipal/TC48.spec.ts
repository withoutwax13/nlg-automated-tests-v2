import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import SetBusinessStatusModal from "../../objects/SetBusinessStatusModal";

const addBusinessPage = new BusinessAdd({ userType: "municipal" });
const setBusinessStatusModal = new SetBusinessStatusModal();
const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal",
});
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });
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
  await municipalBusinessGrid.init();
  await municipalBusinessGrid.clickAddBusinessButton();
  await addBusinessPage.fillFields(newBusinessData);
  await addBusinessPage.clickSaveButton();
};

const operatingStatus = [
  "Inactive",
  "Active/Seasonal",
  "Closed",
  "Sold",
];

test.describe("As a municipal user, I should be able to update operating status in the business details page", () => {
  test("Initiating test", async () => {
    await login({ accountType: "municipal" });
    await municipalBusinessGrid.init();
    await addBusiness();
    await municipalBusinessGrid.init();
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
        await setBusinessStatusModal.clickCloseButton();
      }
    }
  });
});
