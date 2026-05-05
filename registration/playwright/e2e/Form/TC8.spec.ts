import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user opted for not an agency registering in behalf of the customer, the corresponding fields and labels must be visible on the Applicant info step", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();

    cy.login({ accountType: "taxpayer", accountIndex: 7 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);
    cy.getUniqueRegistrationData(randomSeed, false).then(
      (customData: {
        basicInfo: any;
        locationInfo: { locations: any[] };
        applicantInfo: any;
      }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        form.clickNextbutton();
        form.enterLocationDetails(customData.locationInfo.locations);
        form.clickNextbutton();
        form.enterApplicantDetails(customData.applicantInfo, false);
        form.getElement().agencyName().should("exist");
        form.getElement().agencyTypeDropdown().should("exist");
        form.getElement().preparerFullName().should("exist");
        form.getElement().preparerPhone().should("exist");
        form.getElement().preparerEmailAddress().should("exist");
        form.getElement().signature().should("exist");
      }
    );
  });
});
