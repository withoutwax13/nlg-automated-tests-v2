import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import Payment from "../../objects/Payment";
import { createSubmittedApplication, getFilingGridData, getTaxpayerRegistrationRecordId } from "../helpers";
import { getStoredValue, initTestRuntime, login, logout } from "../../support/runtime";

test.describe("As a gov/AGS user, application records with not funded Payment Status in the filing list of credit card payment should be visible in the application list", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const taxpayerApplicationGrid = new ApplicationGrid({ userType: "taxpayer" });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const payment = new Payment();

    await createSubmittedApplication({
      accountIndex: 2,
      formName: "Business License (One-Time) - E2E #2",
      isOneTime: true,
    });
    await payment.payViaAnySavedPaymentMethod();
    const referenceId = getStoredValue<string>("referenceId");
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);
    const paymentStatus = await getFilingGridData("ags", 2, "Payment Status", "Reference ID", referenceId);

    expect(paymentStatus).not.toBe("Funded");
    await agsApplicationGrid.init();
    await agsApplicationGrid.filterColumn("Registration Record ID", String(registrationRecordId));
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
