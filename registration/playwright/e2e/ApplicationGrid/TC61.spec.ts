import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import FilingGrid from "../../objects/FilingGrid";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe("As a user, pending application should be deleted if the corresponding filing is deleted.", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const filingGrid = new FilingGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    pw.login({ accountType: "taxpayer", accountIndex: 4 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);

    pw.getUniqueRegistrationData(randomSeed(), false).then(
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
        form.clickNextbutton();
        formPreviewPage.clickSubmitButton();
        applicationConfirmation
          .getElement()
          .referenceIdData()
          .invoke("text")
          .then((referenceId) => {
            pw.wrap(referenceId).as("referenceId");
          });
        applicationConfirmation.clickCloseButton();
        pw.logout();
        pw.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
        agsApplicationGrid.init();
        pw.get("@referenceId").then((referenceId) => {
          agsApplicationGrid.getDataOfColumn(
            "Application Status",
            "Reference ID",
            String(referenceId),
            "applicationStatus"
          );
          pw.get("@applicationStatus").then((applicationStatus) => {
            expect(applicationStatus).to.equal("Pending");
          });
          filingGrid.init();
          filingGrid.deleteFiling("Reference ID", String(referenceId));
          agsApplicationGrid.init(false);
          agsApplicationGrid.filterColumn("Reference ID", String(referenceId));
          agsApplicationGrid
            .getElement()
            .noRecordFoundComponent()
            .should("exist");
        });
      }
    );
  });
});
