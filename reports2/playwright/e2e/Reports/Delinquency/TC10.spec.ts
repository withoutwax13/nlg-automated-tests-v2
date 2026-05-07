import { expect, test } from "@playwright/test";
import BusinessAdd from "../../../objects/BusinessAdd";
import BusinessGrid from "../../../objects/BusinessGrid";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";
import Login from "../../../utils/Login";

const randomSeed = Math.floor(Math.random() * 10000);
const newBusinessData = {
  legalBusinessName: `Arrakis Spice Fuel Company #${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: `${randomSeed} Desert Road`,
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Spice Fuel Company #${randomSeed}`,
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

const oneYearBeforeCurrentDate = () => {
  const today = new Date();
  return {
    month: today.getMonth() + 1,
    date: today.getDate(),
    year: today.getFullYear() - 1,
  };
};

test.describe.skip(
  "As a municipal user, if I added a form for a business as its remittance requirement and added a start date for delinquency tracking 1 year before the current date, it must produce a delinquency record",
  () => {
    test("Initiating test", async ({ page }) => {
      const municipalDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "municipal",
        municipalitySelection: "City of Arrakis",
      });
      const businessAddPage = new BusinessAdd(page, { userType: "municipal" });
      const businessGrid = new BusinessGrid(page, { userType: "municipal" });
      const manageDelinquencyModal = new ManageDelinquencyModal(page);

      await Login.login(page, { accountType: "municipal", accountIndex: 3 });
      await businessGrid.init();
      await businessGrid.clickAddBusinessButton();
      await businessAddPage.fillFields(newBusinessData);
      await businessAddPage.clickSaveButton();
      await businessGrid.init();
      await businessGrid.addRequiredForms(newBusinessData.locationDba, [
        "Food and Beverage Tax Return (Monthly)",
      ]);

      await businessGrid.clickClearAllFiltersButton();
      await businessGrid.setDelinquencyStartDate(newBusinessData.locationDba, oneYearBeforeCurrentDate());

      await municipalDelinquencyGrid.init();
      await expect(municipalDelinquencyGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
      await municipalDelinquencyGrid.clickManageDelinquencyItem([
        {
          anchorColumnName: "Business Name (DBA)",
          anchorValue: newBusinessData.locationDba,
        },
        {
          anchorColumnName: "Form Name",
          anchorValue: "Food and Beverage Tax Return (Monthly)",
        },
        {
          anchorColumnName: "Filing Period",
          anchorValue: "January 2024",
        },
      ]);
      await expect(manageDelinquencyModal.getElement().modal()).toBeVisible();

      const testBusinessData = await manageDelinquencyModal.saveBusinessDetails();
      expect(testBusinessData.businessName).toBe(newBusinessData.locationDba);
      expect(testBusinessData.formTitle).toBe("Food and Beverage Tax Return (Monthly)");
    });
  }
);
