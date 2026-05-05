import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
} from "../helpers";
import { initTestRuntime, login } from "../../support/runtime";

test.describe("As a taxpayer, I want the system to prohibit me from sending duplicate registrations", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const filing = new Filing();
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 9,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 9,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 9,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 9,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 9 });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Business License (Annual) - E2E #1");
    await filing.clickSubmitNewRegistrationButton();
    await form.clickNextbutton();
    await form.selectIsRegisteringMultipleLocations(false);
    await form.enterBusinessOwnerInformation(customData.basicInfo as any);
    await form.enterLegalBusinessInformation(customData.basicInfo as any);
    await form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
    await form.enterEmergencyPhoneNumbers(customData.basicInfo as any);
    await form.clickNextbutton();
    await form.enterLocationDetails((customData.locationInfo as any).locations);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, true);
    await form.clickNextbutton();
    await expect(formPreviewPage.getElement().duplicateRegistrationWarning()).toBeVisible();
  });
});
