import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should be able to add locations if opted for registering multiple business locations in the basic info step", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 0, true);
    const customData = getUniqueRegistrationData(randomSeed, true);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await expect(form.getElement().addLocationButton()).toBeVisible();
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
  });
});
