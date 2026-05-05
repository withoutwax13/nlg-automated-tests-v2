import { expect, Page } from "@playwright/test";
import selector from "../fixtures/selector.json";
import { loginViaUi, waitForApiResponse } from "../utils/Login";

export default async function viewSubscription(page: Page, projectRoot: string) {
  const subscriptionsPromise = waitForApiResponse(page, {
    method: "GET",
    urlIncludes: "amazonaws.com/subscriptions",
  });

  await loginViaUi(page, projectRoot, { accountType: "ags" });
  await page.locator(selector.navigateMunicipality).click();
  await expect(page).toHaveURL(/\/municipalityApp\/list\//);

  const subscriptionsResponse = await subscriptionsPromise;
  expect(subscriptionsResponse.status()).toBe(200);

  await page.locator(selector.dataLink).filter({ hasText: "Subscriptions" }).click();
  await expect(page.locator(selector.heading2Title).filter({ hasText: "Subscriptions" })).toBeVisible();
}
