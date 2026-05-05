import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import { createSubmittedApplication, getFilingGridData, getTaxpayerRegistrationRecordId } from "../helpers";
import { getStoredValue, initTestRuntime } from "../../support/runtime";

test.describe("As a gov/AGS user, application records with not aplicable Payment Status for the submission payment should be visible in the application list", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    await createSubmittedApplication({
      accountIndex: 3,
      formName: "Business License (Annual) - E2E #1",
    });
    const referenceId = getStoredValue<string>("referenceId");
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);
    const paymentStatus = await getFilingGridData("ags", 3, "Payment Status", "Reference ID", referenceId);

    expect(paymentStatus).toBe("Not Applicable");
    await agsApplicationGrid.init();
    await agsApplicationGrid.filterColumn("Registration Record ID", String(registrationRecordId));
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
