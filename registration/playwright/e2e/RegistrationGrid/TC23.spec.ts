import { expect, test } from "@playwright/test";
import RegistrationGrid from "../../objects/RegistrationGrid";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
} from "../helpers";
import { initTestRuntime } from "../../support/runtime";

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, the Registration Record should not have a certificate button when it's registration status is changed to ACTIVE.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 1,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 1,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 1,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 1,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await registrationGrid.init();
    const certificateCellText = await registrationGrid.getDataOfColumn(
      "Certificate",
      "Registration Record ID",
      String(registrationRecordId),
      "certificateCellText"
    );
    expect(certificateCellText).toBe("");
  });
});
