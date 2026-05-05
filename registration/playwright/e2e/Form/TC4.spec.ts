import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to proceed to Applicant info step if the required details are not provided on the Location info step", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();

    pw.login({ accountType: "taxpayer", accountIndex: 3 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);
    pw.getUniqueRegistrationData(randomSeed, false, [
      "locationInfo.locations[0].locationDBA",
    ]).then(
      (customData: { basicInfo: any; locationInfo: { locations: any[] } }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        form.clickNextbutton();
        form.enterLocationDetails(customData.locationInfo.locations);
        pw.waitForLoading();
        form.getElement().nextButton().should("be.disabled");
      }
    );
  });
});
