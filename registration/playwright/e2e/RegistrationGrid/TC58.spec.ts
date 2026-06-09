import { expect, test } from "@playwright/test";
import RegistrationGrid from "../../objects/RegistrationGrid";
import { logout } from "../../support/native-helpers";
import {
  approvePayAndFundRegistration,
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("When the business is linked and the application is approved, the current registration will be deleted, and a new one will be created with the linked business info.", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(900000);
    const agsRegistrationGrid = new RegistrationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const initial = await submitBusinessLicenseRegistration(page, {
      accountIndex: 4,
      randomSeed: randomSeed(),
    });
    const revokedRegistrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, initial.referenceId);
    await logout(page);
    await approvePayAndFundRegistration(page, {
      accountIndex: 4,
      registrationRecordId: revokedRegistrationRecordId,
      customData: initial.customData,
    });
    await agsRegistrationGrid.init();
    await agsRegistrationGrid.manuallyChangeRegistrationStatus(
      "Revoked",
      "Registration Record ID",
      revokedRegistrationRecordId
    );
    await logout(page);

    const next = await submitBusinessLicenseRegistration(page, {
      accountIndex: 4,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, next.referenceId);
    await logout(page);
    const linkSearch = String(initial.customData.locationInfo.locations[0].locationDBA).match(/\d+/)?.[0] ?? "";
    await approvePayAndFundRegistration(page, {
      accountIndex: 4,
      registrationRecordId,
      customData: next.customData,
      linkExistingBusinessSearch: linkSearch,
    });

    await agsRegistrationGrid.init();
    await agsRegistrationGrid.filterColumn("Registration Record ID", revokedRegistrationRecordId);
    await expect(agsRegistrationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
    await agsRegistrationGrid.clickClearAllFiltersButton();
    await agsRegistrationGrid.filterColumn("Registration Record ID", registrationRecordId);
    await expect(agsRegistrationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
