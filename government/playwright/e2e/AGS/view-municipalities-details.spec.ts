import { expect, test } from '@playwright/test';
import selector from "../../fixtures/selector.json";
import viewMunicipalities from "../../helpers/view-municipalities";

const interactMunicipalitiesDetials = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewMunicipalities(page);
  const detailsIcon = page.locator(selector.detailsIcon).first();
  await expect(detailsIcon).toBeVisible();
  await detailsIcon.click();
  await expect(page).toHaveURL(/\/municipalityApp\/view\//);
  await expect(
    page.locator(selector.heading2Title).filter({ hasText: "Basic information" }).first()
  ).toBeVisible();
};

test.describe("As a government user, I want to be able to view the specific details of Municipalities", () => {
  test("Initiating test", interactMunicipalitiesDetials);
});

export default interactMunicipalitiesDetials;
