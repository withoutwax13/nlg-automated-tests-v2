import { expect, test } from "@playwright/test";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  openRegistrationRecord,
  payApplicationAsTaxpayer,
} from "../helpers";
import { initTestRuntime } from "../../support/runtime";

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, the Registration Record should not have a certificate button under the Active Registration Card when it's registration status is changed to ACTIVE or approved via Application Reviewer.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 5,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 5,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 5,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 5,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    const registrationRecord = await openRegistrationRecord(String(registrationRecordId));
    await expect(registrationRecord.getElements().downloadCertificateButton()).toHaveCount(0);
  });
});
