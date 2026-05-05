import { test, expect } from "@playwright/test";
import path from "path";
import selector from "../../fixtures/selector.json";
import { loginViaUi, waitForApiResponse } from "../../utils/Login";

const navigateToMunicipalities = async (page: any, projectRoot: string) => {
  const municipalListPromise = waitForApiResponse(page, {
    method: "GET",
    urlIncludes: "amazonaws.com/municipalities",
  });

  await loginViaUi(page, projectRoot, { accountType: "ags" });
  await page.locator(selector.navigateMunicipality).click();
  await expect(page).toHaveURL(/\/municipalityApp\/list\//);

  const municipalListResponse = await municipalListPromise;
  expect(municipalListResponse.status()).toBe(200);

  await page.locator(selector.dataLink).filter({ hasText: "Municipalities" }).click();
  await expect(page.locator(selector.heading2Title).filter({ hasText: "Municipalities" })).toBeVisible();
};

const navigateToAddMunicipality = async (page: any) => {
  const addMunicipalityPromise = waitForApiResponse(page, {
    method: "GET",
    urlIncludes: "amazonaws.com/ReportsListInfo",
  });

  await page.locator(selector.addMunicipalityButton).click();
  const addMunicipalityResponse = await addMunicipalityPromise;
  expect(addMunicipalityResponse.status()).toBe(200);

  await expect(page.locator(selector.addingMuniForm)).toBeVisible();
  await expect(page.locator(selector.heading1Title).filter({ hasText: "Create a new Municipality" })).toBeVisible();
};

const pickDropdownOption = async (page: any, label: string, optionText: string) => {
  await page.locator(selector.inputLabel).filter({ hasText: label }).first().locator("xpath=following-sibling::*[1]").click();
  await page
    .locator(selector.optionListContainer)
    .locator(selector.optionList)
    .locator(selector.optionItem)
    .filter({ hasText: optionText })
    .first()
    .click();
};

test.describe("As an AGS user, I want to set the time zone, province and country for a government", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await navigateToMunicipalities(page, projectRoot);
    await navigateToAddMunicipality(page);
    await pickDropdownOption(page, "Country", "Canada");
    await pickDropdownOption(page, "Government Province", "AB");
    await pickDropdownOption(page, "Time Zone", "America/Edmonton");
  });
});
