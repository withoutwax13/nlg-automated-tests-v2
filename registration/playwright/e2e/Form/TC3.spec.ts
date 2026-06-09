import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData, waitForLoading } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to proceed to Location info step if the required details are not provided on the basic info step", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 2, false);
    const customData = getUniqueRegistrationData(randomSeed, false, ["basicInfo.federalIdentificationNumber"]);

    await enterBasicInformation(form, customData.basicInfo);
    await waitForLoading(page);
    await expect(form.getElement().nextButton()).toBeDisabled();
  });
});
