import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
} from "../helpers";
import { currentPage, initTestRuntime, logout, login } from "../../support/runtime";

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, there should be no certificate under the Certificate Tab of the said record when it is APPROVED", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const municipalApplicationGrid = new ApplicationGrid({ userType: "municipal" });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 5,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "municipal",
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

    await logout();
    await login({ accountType: "municipal", notFirstLogin: true, accountIndex: 5 });
    await municipalApplicationGrid.init();
    await municipalApplicationGrid.clickClearAllFiltersButton();
    await municipalApplicationGrid.selectRowToReview({
      anchorColumnName: "Registration Record ID",
      anchorValue: String(registrationRecordId),
    });
    await municipalApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
    await expect(
      currentPage().locator("li, a, button").filter({ hasText: "Certificate" })
    ).toHaveCount(0);
  });
});
