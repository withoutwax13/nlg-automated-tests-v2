import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to add locations if opted for registering single business location in the basic info step", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();

    cy.login({ accountType: "taxpayer", accountIndex: 1 });
    
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);
    cy.getUniqueRegistrationData(randomSeed, false).then(
      (customData: { basicInfo: any; locationInfo: { locations: any[] } }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        form.clickNextbutton();
        form.getElement().addLocationButton().should("not.exist");
        form.enterLocationDetails(customData.locationInfo.locations);
      }
    );
  });
});
