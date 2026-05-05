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

test.describe.skip("As an AGS user, an active registration that cannot renew yet should be able to do so if I manually change the next due date to today", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 3,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 3,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 3,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 3,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await registrationGrid.init();
    const canRenewStatusInitial = await registrationGrid.getDataOfColumn(
      "Can Renew",
      "Registration Record ID",
      String(registrationRecordId),
      "canRenewStatusInitial"
    );
    expect(canRenewStatusInitial).toBe("Not Available");

    const today = new Date();
    const tenDaysBefore = new Date(today.setDate(today.getDate() - 10));
    const formattedDate = `${tenDaysBefore.getMonth() + 1}/${tenDaysBefore.getDate()}/${tenDaysBefore.getFullYear()}`;
    await registrationGrid.clickClearAllFiltersButton();
    await registrationGrid.manuallyChangeRegistrationDate(
      "Next Due Date",
      formattedDate,
      "Registration Record ID",
      String(registrationRecordId),
      true
    );

    await registrationGrid.clickClearAllFiltersButton();
    const canRenewStatusFinal = await registrationGrid.getDataOfColumn(
      "Can Renew",
      "Registration Record ID",
      String(registrationRecordId),
      "canRenewStatusFinal"
    );
    expect(canRenewStatusFinal).toBe("Available");
  });
});
