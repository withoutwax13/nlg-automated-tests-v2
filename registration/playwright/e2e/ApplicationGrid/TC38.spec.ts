import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";
import { submitBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a gov/AGS user, application records with not funded Payment Status in the filing list of credit card payment should be visible in the application list", () => {
  test("Initiating test", async ({ page }) => {
    const taxpayerApplicationGrid = new ApplicationGrid(page, { userType: "taxpayer" });
    const agsApplicationGrid = new ApplicationGrid(page, { userType: "ags", municipalitySelection: "City of Arrakis" });
    const filingGrid = new FilingGrid(page, { userType: "ags", municipalitySelection: "City of Arrakis" });
    const { referenceId } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 2,
      formName: "Business License (One-Time) - E2E #2",
      isOneTime: true,
      hasPayment: true,
      randomSeed: randomSeed(),
    });

    await taxpayerApplicationGrid.init();
    const registrationRecordId = await taxpayerApplicationGrid.getDataOfColumn("Registration Record ID", "Reference ID", referenceId);
    await logout(page);
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 2 });

    await filingGrid.init();
    const paymentStatus = await filingGrid.getDataOfColumn("Payment Status", "Reference ID", referenceId);
    expect(paymentStatus).not.toBe("Funded");

    await agsApplicationGrid.init();
    await agsApplicationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
