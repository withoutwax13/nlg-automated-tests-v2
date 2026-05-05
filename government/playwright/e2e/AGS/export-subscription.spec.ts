import { expect, test } from '@playwright/test';
import viewSubscription from "../../helpers/view-subscription";
import selector from "../../fixtures/selector.json";

const exportSubscription = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewSubscription(page);

  const exportButton = page.locator(selector.button).filter({ hasText: "Export" }).first();
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
};

test.describe("As a government user, I want to be able to export the list of Subscriptions", () => {
  test("Initiating test", exportSubscription);
});

export default exportSubscription;
