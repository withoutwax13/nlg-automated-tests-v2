import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../../objects/ApplicationGrid";
import FilingGrid from "../../../objects/FilingGrid";
import Login from "../../../utils/Login";
import { logout } from "../../../support/native-helpers";
import {
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("Verify taxpayer can submit a registration with submission payment active, taxpayer can see it, AGS cannot see it in Application List until the filing is funded, and AGS can see it after funding.", () => {
  test.skip("Initiating test", async ({ page }) => {
    test.setTimeout(500000);
    const { referenceId } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 2,
      formName: "Business License (One-Time) - E2E #2",
      isOneTime: true,
      hasPayment: true,
      paymentMethod: 1,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await Login.login(page, { accountType: "ags", accountIndex: 2, notFirstLogin: true });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const agsApplicationGrid = new ApplicationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await filingGrid.init();
    const paymentStatus = await filingGrid.getDataOfColumn("Payment Status", "Reference ID", referenceId);
    expect(paymentStatus).not.toContain("Funded");

    await agsApplicationGrid.init();
    await agsApplicationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toBeVisible();

    await filingGrid.init();
    await filingGrid.updateStatus("Funded", "Reference ID", referenceId);
    await logout(page);

    await Login.login(page, { accountType: "ags", accountIndex: 2, notFirstLogin: true });
    await filingGrid.init();
    const paymentStatusAfterLogin = await filingGrid.getDataOfColumn("Payment Status", "Reference ID", referenceId);
    expect(paymentStatusAfterLogin).toContain("Funded");

    await agsApplicationGrid.init();
    await agsApplicationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
