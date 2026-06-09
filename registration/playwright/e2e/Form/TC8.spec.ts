import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user opted for not an agency registering in behalf of the customer, the corresponding fields and labels must be visible on the Applicant info step", () => {
  test("Initiating test", async ({ page }) => {
    const { form } = await startBusinessLicenseRegistration(page, 7, false);
    const customData = getUniqueRegistrationData(randomSeed, false);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, false);
    await expect(form.getElement().agencyName()).toBeVisible();
    await expect(form.getElement().agencyTypeDropdown()).toBeVisible();
    await expect(form.getElement().preparerFullName()).toBeVisible();
    await expect(form.getElement().preparerPhone()).toBeVisible();
    await expect(form.getElement().preparerEmailAddress()).toBeVisible();
    await expect(form.getElement().signature()).toBeVisible();
  });
});
