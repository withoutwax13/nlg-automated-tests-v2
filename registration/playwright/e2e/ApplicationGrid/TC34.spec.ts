import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import { submitBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a Business User, when a Registration Record is added into my Registration List, I can see a unique Registration Record ID in the application data grid column.", () => {
  test("Initiating test", async ({ page }) => {
    const taxpayerApplicationGrid = new ApplicationGrid(page, { userType: "taxpayer" });
    const { referenceId } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 0,
      randomSeed: randomSeed(),
    });

    await taxpayerApplicationGrid.init();
    const registrationRecordId = await taxpayerApplicationGrid.getDataOfColumn("Registration Record ID", "Reference ID", referenceId);
    await taxpayerApplicationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(taxpayerApplicationGrid.getElement().rows()).toHaveCount(1);
  });
});
