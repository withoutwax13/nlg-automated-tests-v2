import { expect, test } from "@playwright/test";
import RegistrationGrid from "../../objects/RegistrationGrid";
import { logout } from "../../support/native-helpers";
import {
  approvePayAndFundRegistration,
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a Government User, when a Registration Record is created and added to my Registration List, I can see a unique Registration Record ID in the data grid column.", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 0,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await approvePayAndFundRegistration(page, {
      accountIndex: 0,
      registrationRecordId,
      customData,
    });

    const registrationGrid = new RegistrationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await registrationGrid.init();
    await registrationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(registrationGrid.getElement().rows()).toHaveCount(1);
  });
});
