import { expect, test } from "@playwright/test";
import { logout } from "../../support/native-helpers";
import {
  getRegistrationRecordIdFromTaxpayerGrid,
  reviewRegistrationApplication,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a gov user, I want to be able to do final rejection", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 8,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    const { applicationReview } = await reviewRegistrationApplication(page, {
      accountType: "municipal",
      accountIndex: 8,
      registrationRecordId,
      customData,
      action: "Reject",
    });
    await expect(applicationReview.getElements().applicationStatusData()).toContainText("Rejected");
  });
});
