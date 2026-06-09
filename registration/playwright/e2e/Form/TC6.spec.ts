import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user clicks the 'Add Location' button on the location info step, a new set of input fields must be visible", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 5, true);
    const customData = getUniqueRegistrationData(randomSeed, true);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await expect(form.getElement().addLocationButton()).toBeVisible();
    await form.clickAddLocationButton();
    await expect(form.getElement().locationAddress1().nth(1)).toBeVisible();
    await expect(form.getElement().locationAddress2().nth(1)).toBeVisible();
    await expect(form.getElement().locationCity().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingStateDropdown().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingZipCode().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorFullName().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorPhoneNumber().nth(1)).toBeVisible();
  });
});
