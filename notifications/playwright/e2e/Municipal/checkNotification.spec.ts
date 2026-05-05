import { expect, test, type Page } from "@playwright/test";
import selector from "../../fixtures/selector.json";
import { login, waitForApiResponse } from "../../utils/Login";

const checkNotifications = async ({ page }: { page: Page }) => {
  await login(page, { accountType: "municipal" });

  const notificationResponse = waitForApiResponse(page, {
    method: "GET",
    urlPart: "/Notifications?notificationStatus=undefined",
  });
  await expect(page.locator(selector.notificationIcon)).toBeVisible();
  await page.locator(selector.notificationIcon).click();
  await notificationResponse;
  await expect(page).toHaveURL(/\/NotificationsApp\/NotificationsList/);
};





test.describe("As a municipal, I should be able to view notifications.", () => {
  test("Initiating test", checkNotifications);
});

export default checkNotifications;
