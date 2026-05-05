import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import { createSubmittedApplication, getTaxpayerRegistrationRecordId } from "../helpers";
import { getStoredValue, initTestRuntime } from "../../support/runtime";

test.describe("As a Business User, when a Registration Record is added into my Registration List, I can see a unique “Registration Record ID” in the application data grid column.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const taxpayerApplicationGrid = new ApplicationGrid({ userType: "taxpayer" });

    await createSubmittedApplication({
      accountIndex: 0,
      formName: "Business License (Annual) - E2E #1",
    });
    const referenceId = getStoredValue<string>("referenceId");
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);
    await taxpayerApplicationGrid.filterColumn("Registration Record ID", String(registrationRecordId));
    await expect(taxpayerApplicationGrid.getElement().rows()).toHaveCount(1);
  });
});
