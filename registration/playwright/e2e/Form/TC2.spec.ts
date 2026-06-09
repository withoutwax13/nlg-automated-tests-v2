import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to add locations if opted for registering single business location in the basic info step", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 1, false);
    const customData = getUniqueRegistrationData(randomSeed, false);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await expect(form.getElement().addLocationButton()).toHaveCount(0);
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
  });
});
