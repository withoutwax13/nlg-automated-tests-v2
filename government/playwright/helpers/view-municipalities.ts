import { expect, Page } from "@playwright/test";
import selector from "../fixtures/selector.json";
import { loginViaUi, waitForApiResponse } from "../utils/Login";

export default async function viewMunicipalities(page: Page, projectRoot: string) {
  const municipalitiesPromise = waitForApiResponse(page, {
    method: "GET",
    urlIncludes: "amazonaws.com/municipalities",
  });

  await loginViaUi(page, projectRoot, { accountType: "ags" });
  await page.locator(selector.navigateMunicipality).click();
  await expect(page).toHaveURL(/\/municipalityApp\/list\//);

  const municipalitiesResponse = await municipalitiesPromise;
  expect(municipalitiesResponse.status()).toBe(200);

  await page.locator(selector.dataLink).filter({ hasText: "Municipalities" }).click();
  await expect(page.locator(selector.heading2Title).filter({ hasText: "Municipalities" })).toBeVisible();
}
