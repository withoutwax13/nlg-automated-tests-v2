import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData, waitForLoading } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to proceed to Applicant info step if the required details are not provided on the Location info step", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 3, false);
    const customData = getUniqueRegistrationData(randomSeed, false, ["locationInfo.locations[0].locationDBA"]);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
    await waitForLoading(page);
    await expect(form.getElement().nextButton()).toBeDisabled();
  });
});
