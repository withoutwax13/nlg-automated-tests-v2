import { expect, test } from "@playwright/test";
import { getUniqueRegistrationData, normalizeText } from "../../support/native-helpers";
import { enterBasicInformation, startBusinessLicenseRegistration } from "../helpers/registration-form-workflows";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User must see the current date on the Applicant info step", () => {
  test("Initiating test", async ({ page }) => {
    const today = new Date().toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
    const { form } = await startBusinessLicenseRegistration(page, 9, false);
    const customData = getUniqueRegistrationData(randomSeed, false);

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, true);
    const text = normalizeText(await form.getElement().applicantInfoDateData().textContent());
    expect([today, tomorrow, yesterday]).toContain(text);
  });
});
