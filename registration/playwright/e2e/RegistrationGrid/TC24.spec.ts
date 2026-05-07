import { expect, test } from "@playwright/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import RegistrationGrid from "../../objects/RegistrationGrid";
import { currentPage, initTestRuntime, login, logout, waitForLoading } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 100000);
const customData = {
  legalBusinessName: `dummy data ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: `123 Desert Road ${randomSeed}`,
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `dummy dba data ${randomSeed}`,
  stateTaxId: "ST-9876543",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: `Paul Atreides var #${randomSeed}`,
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe.skip("As an AGS User, If I delete a business record associated to an ACTIVE Registration record, the Registration Status of the said registration record should be deleted.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "Arrakis",
    });
    const businessAddPage = new BusinessAdd({ userType: "ags" });
    const businessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: "Arrakis",
    });
    const businessDetailsPage = new BusinessDetails({ userType: "ags" });

    await Login.login(page, { accountType: "ags", accountIndex: 2 });
    await businessGrid.init();
    await businessGrid.clickAddBusinessButton();
    await businessAddPage.fillFields(customData);
    await businessAddPage.clickSaveButton();
    await businessGrid.init();
    await businessGrid.viewBusinessDetails(customData.locationDba);
    await expect(currentPage()).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await businessDetailsPage.clickFormsTab();
    await businessDetailsPage.enableForm("Business License (Annual) - E2E #1");

    await waitForLoading();
    await registrationGrid.init();
    const regRecordId = await registrationGrid.getDataOfColumn(
      "Registration Record ID",
      "Location DBA",
      customData.locationDba,
      "regRecordId"
    );
    await registrationGrid.clickClearAllFiltersButton();
    await registrationGrid.manuallyChangeRegistrationStatus(
      "Active",
      "Location DBA",
      customData.locationDba
    );
    await registrationGrid.clickClearAllFiltersButton();
    const registrationStatus = await registrationGrid.getDataOfColumn(
      "Registration Status",
      "Registration Record ID",
      String(regRecordId),
      "registrationStatus"
    );
    expect(registrationStatus).toBe("Active");

    await businessGrid.init();
    await businessGrid.deleteBusiness(customData.locationDba);

    await logout();
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 2 });
    await registrationGrid.init();
    await registrationGrid.filterColumn("Location DBA", customData.locationDba);
    await expect(registrationGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});