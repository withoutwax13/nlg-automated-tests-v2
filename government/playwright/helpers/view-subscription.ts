import { expect, type Page } from "@playwright/test";
import selector from "../fixtures/selector.json";
import {
  clickLocatorByText,
  expectLocatorWithText,
  login,
  waitForApiResponse,
} from "../support/native-helpers";

export default async function viewSubscription(page: Page): Promise<void> {
  await login(page, { accountType: "ags" });
  await page.locator(selector.navigateMunicipality).click();
  await expect(page).toHaveURL(/\/municipalityApp\/list\//);

  await waitForApiResponse(page, {
    method: "GET",
    urlPart: "/subscriptions",
  });
  await clickLocatorByText(page.locator(selector.dataLink), "Subscriptions");
  await expectLocatorWithText(page.locator(selector.heading2Title), "Subscriptions");
}
