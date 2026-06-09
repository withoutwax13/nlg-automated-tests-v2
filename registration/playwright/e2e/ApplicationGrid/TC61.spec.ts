import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";
import { submitBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a user, pending application should be deleted if the corresponding filing is deleted.", () => {
  test("Initiating test", async ({ page }) => {
    const agsApplicationGrid = new ApplicationGrid(page, { userType: "ags", municipalitySelection: "City of Arrakis" });
    const filingGrid = new FilingGrid(page, { userType: "ags", municipalitySelection: "City of Arrakis" });
    const { referenceId } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 9,
      randomSeed: randomSeed(),
    });

    await logout(page);
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 4 });
    await agsApplicationGrid.init();
    const applicationStatus = await agsApplicationGrid.getDataOfColumn("Application Status", "Reference ID", referenceId);
    expect(applicationStatus).toBe("Pending");

    await filingGrid.init();
    await filingGrid.deleteFiling("Reference ID", referenceId);
    await agsApplicationGrid.init(false);
    await agsApplicationGrid.filterColumn("Reference ID", referenceId);
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});
