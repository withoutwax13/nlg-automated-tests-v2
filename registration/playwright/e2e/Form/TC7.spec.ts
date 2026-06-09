import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user clicks the 'Remove' button on the location info step, the corresponding set of input fields must be removed", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 6, true);
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
    await form.clickRemoveLocationButton();
    await expect(form.getElement().locationAddress1()).toHaveCount(1);
    await expect(form.getElement().locationAddress2()).toHaveCount(1);
    await expect(form.getElement().locationCity()).toHaveCount(1);
    await expect(form.getElement().locationMailingStateDropdown()).toHaveCount(1);
    await expect(form.getElement().locationMailingZipCode()).toHaveCount(1);
    await expect(form.getElement().managerOperatorFullName()).toHaveCount(1);
    await expect(form.getElement().managerOperatorPhoneNumber()).toHaveCount(1);
  });
});
