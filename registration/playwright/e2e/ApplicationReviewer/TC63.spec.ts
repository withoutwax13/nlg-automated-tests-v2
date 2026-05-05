import { expect, test } from "@playwright/test";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
} from "../helpers";
import { initTestRuntime, textOf } from "../../support/runtime";

test.describe("As a gov user, I want to be able to do final rejection", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 8,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    const { applicationReview } = await approveApplication({
      reviewerType: "municipal",
      reviewerIndex: 8,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
      finalAction: "Reject",
    });

    await expect(await textOf(applicationReview.getElements().applicationStatusData())).toContain("Rejected");
  });
});
