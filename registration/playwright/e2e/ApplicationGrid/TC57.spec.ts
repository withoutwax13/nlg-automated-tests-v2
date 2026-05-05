import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  payApplicationAsTaxpayer,
} from "../helpers";
import { initTestRuntime, textOf } from "../../support/runtime";

test.describe("As an AGS user, I want to be able to update the payment status for an application to Refunded manually", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 6,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    const { applicationReview } = await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 6,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await expect(
      await textOf(applicationReview.getElements().applicationStatusData())
    ).toMatch(/Approval Payment Required|Approved/);
    await applicationReview.clickGoBackApplicationsButton();

    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 6,
    });

    await agsApplicationGrid.init();
    const approvalPaymentStatusBeforeManualChange = await agsApplicationGrid.getDataOfColumn(
      "Approval Payment Status",
      "Registration Record ID",
      String(registrationRecordId),
      "approvalPaymentStatusBeforeManualChange"
    );
    await agsApplicationGrid.clickClearAllFiltersButton();
    await agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
      "Fully Paid",
      "Registration Record ID",
      String(registrationRecordId)
    );
    await agsApplicationGrid.clickClearAllFiltersButton();
    const approvalPaymentStatusAfterManualChange = await agsApplicationGrid.getDataOfColumn(
      "Approval Payment Status",
      "Registration Record ID",
      String(registrationRecordId),
      "approvalPaymentStatusAfterManualChange"
    );

    expect(approvalPaymentStatusBeforeManualChange).not.toBe(approvalPaymentStatusAfterManualChange);
    expect(approvalPaymentStatusBeforeManualChange).toBe("Pending");
    expect(approvalPaymentStatusAfterManualChange).toBe("Fully Paid");
  });
});
