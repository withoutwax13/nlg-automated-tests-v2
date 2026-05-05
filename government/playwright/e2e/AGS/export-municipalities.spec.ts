import { expect, test } from '@playwright/test';
import viewMunicipalities from "../../helpers/view-municipalities";
import selector from "../../fixtures/selector.json";

const exportMunicipalities = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewMunicipalities(page);

  const exportButton = page.locator(selector.button).filter({ hasText: "Export" }).first();
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
};

test.describe("As a government user, I want to be able to export the list of Municipalities", () => {
  test("Initiating test", exportMunicipalities);
});

export default exportMunicipalities;
