import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";
import BusinessAdd from "../../../objects/BusinessAdd";
import BusinessGrid from "../../../objects/BusinessGrid";

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

describe.skip(
  "As an AGS user, if I added a form for a business as its remittance requirement and added a start date for delinquency tracking 1 year before the current date, it must produce a delinquency record",
  { tags: ["regression"] },
  () => {
    it("Initiating test", () => {
      const agsDelinquencyGrid = new DelinquencyGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      const businessAddPage = new BusinessAdd({ userType: "ags" });
      const businessGrid = new BusinessGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      const manageDelinquencyModal = new ManageDelinquencyModal();
      cy.login({ accountType: "ags", accountIndex: 3 });
      businessGrid.init();
      businessGrid.clickAddBusinessButton();
      businessAddPage.fillFields(newBusinessData);
      businessAddPage.clickSaveButton();
      businessGrid.init();
      businessGrid.addRequiredForms(newBusinessData.locationDba, [
        "Food and Beverage Tax Return (Monthly)",
      ]);

      businessGrid.clickClearAllFiltersButton();
      businessGrid.setDelinquencyStartDate(newBusinessData.locationDba, {
        month: oneYearBeforeCurrentDate().month,
        date: oneYearBeforeCurrentDate().date,
        year: oneYearBeforeCurrentDate().year,
      });

      agsDelinquencyGrid.init();
      agsDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
      agsDelinquencyGrid.clickManageDelinquencyItem([
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
      manageDelinquencyModal.getElement().modal().should("exist");
      manageDelinquencyModal.saveBusinessDetails("testBusinessData");
      cy.get("@testBusinessData").then((testBusinessData: any) => {
        expect(testBusinessData.businessName).to.equal(
          newBusinessData.locationDba
        );
        expect(testBusinessData.formTitle).to.equal(
          "Food and Beverage Tax Return (Monthly)"
        );
      });
    });
  }
);
