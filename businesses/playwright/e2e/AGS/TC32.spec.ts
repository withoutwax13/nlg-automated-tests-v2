import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessResetModal from "../../objects/BusinessResetModal";
import BusinessAdd from "../../objects/BusinessAdd";
import Login from "../../utils/Login";

const addBusinessPage = new BusinessAdd({ userType: "ags" });
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Pili",
});
const businessResetModal = new BusinessResetModal();

const randomSeed = Math.floor(Math.random() * 100000);
const newBusinessData = {
  legalBusinessName: `Arrakis Spice Company ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Spice Company ${randomSeed}`,
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
  await agsBusinessGrid.init(false, false);
  await agsBusinessGrid.clickAddBusinessButton();
  await addBusinessPage.fillFields(newBusinessData);
  await addBusinessPage.clickSaveButton();
};

test.describe("I should be able to reset all data of a specific municipality", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags" });
    await addBusiness();
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickResetDataButton();
    await businessResetModal.clickSureWantToDeleteDataCheckbox();
    await businessResetModal.clickDeleteDataButton();
    await expect(agsBusinessGrid.getElement().noRecordFoundComponent()).toBeVisible();

    // TODO: Assert that all other data in the municipality has been deleted as well (e.g. registration, filings, etc.)
  });
});