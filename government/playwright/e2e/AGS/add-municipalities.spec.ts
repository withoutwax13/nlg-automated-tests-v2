import { expect, test } from '@playwright/test';
import selector from "../../fixtures/selector.json";
import viewMunicipalities from "../../helpers/view-municipalities";
import { waitForApiResponse } from "../../support/native-helpers";

const addMunicipalities = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewMunicipalities(page);

  const addMunicipalityResponse = waitForApiResponse(page, {
    method: "GET",
    urlPart: "/ReportsListInfo",
  });

  await page.locator(selector.addMunicipalityButton).click();
  await addMunicipalityResponse;
  await expect(page.locator(selector.addingMuniForm)).toBeVisible();
  await expect(
    page.locator(selector.heading1Title).filter({ hasText: "Create a new Municipality" }).first()
  ).toBeVisible();
};

test.describe("As a government user, I want to be able to add a Municipality", () => {
  test("Initiating test", addMunicipalities);
});

export default addMunicipalities;
