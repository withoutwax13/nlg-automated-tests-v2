import { expect, test } from "@playwright/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import RegistrationGrid from "../../objects/RegistrationGrid";
import { currentPage, initTestRuntime, login, waitForLoading } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 100000);
const customData = {
  legalBusinessName: `TC21dummy data ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: `TC21123 Desert Road ${randomSeed}`,
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `TC21dummy dba data ${randomSeed}`,
  stateTaxId: "ST-9876543",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: `TC21Paul Atreides var #${randomSeed}`,
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe("As an AGS User, when I select a form submission requirement in a business' details page and it is a RegistrationForm type and is Active, a Registration Record will automatically be generated for that business and form and appear in the Registration List. If no applications has been submitted for the Registration Record, the Registration Status will be “Not Registered” by default.", () => {
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

    await Login.login({ accountType: "ags", accountIndex: 9 });
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
    const registrationStatus = await registrationGrid.getDataOfColumn(
      "Registration Status",
      "Location DBA",
      customData.locationDba,
      "registrationStatus"
    );
    expect(registrationStatus).toBe("Not Registered");
  });
});