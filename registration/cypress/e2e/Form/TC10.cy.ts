import Filing from "../../objects/Filing";
import Form from "../../objects/Form";

const randomSeed = Math.floor(Math.random() * 1000);

describe("User must see the current date on the Applicant info step", () => {
  it("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const yesterday = new Date(
      new Date().setDate(new Date().getDate() - 1)
    ).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const tomorrow = new Date(
      new Date().setDate(new Date().getDate() + 1)
    ).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    cy.login({ accountType: "taxpayer", accountIndex: 9 });

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
        form.enterApplicantDetails(customData.applicantInfo, true);
        form
          .getElement()
          .applicantInfoDateData()
          .invoke("text")
          .then((text) => {
            expect([today, tomorrow, yesterday]).to.include(text);
            // based on the timezone of the server, the date will be either today, tomorrow, or yesterday
          });
      }
    );
  });
});
