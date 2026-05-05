import { expect, test } from '@playwright/test';
import selector from "../../fixtures/selector.json";
import viewMunicipalities from "../../helpers/view-municipalities";
import { waitForApiResponse } from "../../support/native-helpers";

const selectLabeledOption = async (
  { page }: { page: import("@playwright/test").Page },
  label: string,
  optionText: string
) => {
  const labelLocator = page.locator(selector.inputLabel).filter({ hasText: label }).first();
  await labelLocator.locator("xpath=following-sibling::*[1]").click();
  await page
    .locator(selector.optionListContainer)
    .locator(selector.optionList)
    .locator(selector.optionItem)
    .filter({ hasText: optionText })
    .first()
    .click();
};

const setTimezoneProvinceCountryNewMunicipality = async ({
  page,
}: {
  page: import("@playwright/test").Page;
}) => {
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

  await selectLabeledOption({ page }, "Country", "Canada");
  await selectLabeledOption({ page }, "Government Province", "AB");
  await selectLabeledOption({ page }, "Time Zone", "America/Edmonton");
};

test.describe("As an AGS user, I want to set the time zone, province and country for a government", () => {
  test("Initiating test", setTimezoneProvinceCountryNewMunicipality);
});

export default setTimezoneProvinceCountryNewMunicipality;
