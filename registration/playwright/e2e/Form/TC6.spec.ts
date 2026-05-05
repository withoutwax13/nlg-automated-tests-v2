import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user clicks the 'Add Location' button on the location info step, a new set of input fields must be visible", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();

    cy.login({ accountType: "taxpayer", accountIndex: 5 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(true);
    cy.getUniqueRegistrationData(randomSeed, true).then(
      (customData: { basicInfo: any; locationInfo: { locations: any[] } }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        form.clickNextbutton();
        form.getElement().addLocationButton().should("exist");
        form.clickAddLocationButton();
        form.getElement().locationAddress1().eq(1).should("exist");
        form.getElement().locationAddress2().eq(1).should("exist");
        form.getElement().locationCity().eq(1).should("exist");
        form.getElement().locationMailingStateDropdown().eq(1).should("exist");
        form.getElement().locationMailingZipCode().eq(1).should("exist");
        form.getElement().managerOperatorFullName().eq(1).should("exist");
        form.getElement().managerOperatorPhoneNumber().eq(1).should("exist");
      }
    );
  });
});
