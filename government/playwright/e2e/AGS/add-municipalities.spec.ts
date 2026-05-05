import { test, expect } from "@playwright/test";
import path from "path";
import selector from "../../fixtures/selector.json";
import { loginViaUi, waitForApiResponse } from "../../utils/Login";

const viewMunicipalities = async (page: any, projectRoot: string) => {
  const municipalListPromise = waitForApiResponse(page, {
    method: "GET",
    urlIncludes: "amazonaws.com/municipalities",
  });

  await loginViaUi(page, projectRoot, { accountType: "ags" });
  await page.locator(selector.navigateMunicipality).click();
  await expect(page).toHaveURL(/\/municipalityApp\/list\//);

  const municipalList = await municipalListPromise;
  expect(municipalList.status()).toBe(200);

  await page.locator(selector.dataLink).filter({ hasText: "Municipalities" }).click();
  await expect(page.locator(selector.heading2Title).filter({ hasText: "Municipalities" })).toBeVisible();
};

const addMunicipality = async (page: any) => {
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

test.describe("As a government user, I want to be able to add a Municipality", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await viewMunicipalities(page, projectRoot);
    await addMunicipality(page);
  });
});
