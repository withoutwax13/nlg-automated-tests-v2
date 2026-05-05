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

test.describe("As a Government User, when a Registration Record is created and added to my Registration List, I can see a unique “Registration Record ID” in the data grid column.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 0,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 0,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 0,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 0,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await registrationGrid.init();
    await registrationGrid.filterColumn("Registration Record ID", String(registrationRecordId));
    await expect(registrationGrid.getElement().rows()).toHaveCount(1);
  });
});
