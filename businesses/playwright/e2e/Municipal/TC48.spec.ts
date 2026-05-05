import { test, expect } from '@playwright/test';
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

const addBusiness = () => {
  municipalBusinessGrid.init();
  municipalBusinessGrid.clickAddBusinessButton();
  addBusinessPage.fillFields(newBusinessData);
  addBusinessPage.clickSaveButton();
};

const operatingStatus = [
  "Inactive",
  "Active/Seasonal",
  "Closed",
  "Sold",
];

test.describe("As a municipal user, I should be able to update operating status in the business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal" });
    municipalBusinessGrid.init();
    addBusiness();
    municipalBusinessGrid.init();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    operatingStatus.forEach((status) => {
      if (status === "Active/Seasonal" || status === "Inactive") {
        municipalBusinessDetails.clickBusinessStatusTab();
        municipalBusinessDetails.getElement().operatingStatusDropdown().click();
        municipalBusinessDetails.getElement().anyList().contains(status).click();
        setBusinessStatusModal.getElement().modal().should("exist");
        setBusinessStatusModal.getElement().cancelButton().click();
      } else {
        municipalBusinessDetails.clickBusinessStatusTab();
        municipalBusinessDetails.getElement().operatingStatusDropdown().click();
        municipalBusinessDetails.getElement().anyList().contains(status).click();
        setBusinessStatusModal.getElement().modal().should("exist");
        setBusinessStatusModal.clickCloseButton();
      }
    });
  });
});
