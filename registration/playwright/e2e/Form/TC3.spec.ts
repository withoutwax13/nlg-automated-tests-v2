import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to proceed to Location info step if the required details are not provided on the basic info step", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();

    cy.login({ accountType: "taxpayer", accountIndex: 2 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);
    cy.getUniqueRegistrationData(randomSeed, false, [
      "basicInfo.federalIdentificationNumber",
    ]).then(
      (customData: { basicInfo: any; locationInfo: { locations: any[] } }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        cy.waitForLoading();
        form.getElement().nextButton().should("be.disabled");
      }
    );
  });
});
