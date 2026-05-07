import { expect, test, type Page } from "@playwright/test";
import selector from "../../fixtures/selector.json";
import Login, { login, waitForApiResponse } from "../../utils/Login";

const checkUnreadNotification = async ({ page }: { page: Page }) => {
  await Login.login(page, page, { accountType: "taxpayer" });

  const notificationResponse = waitForApiResponse(page, {
    method: "GET",
    urlPart: "/Notifications?notificationStatus=undefined",
  });
  await expect(page.locator(selector.notificationIcon)).toBeVisible();
  await page.locator(selector.notificationIcon).click();
  await notificationResponse;
  await expect(page).toHaveURL(/\/NotificationsApp\/NotificationsList/);

  const unreadNotificationResponse = waitForApiResponse(page, {
    method: "GET",
    urlPart: "/Notifications?notificationStatus=UNREAD",
  });
  await expect(page.locator(selector.switchUnreadNotif)).toBeVisible();
  await page.locator(selector.switchUnreadNotif).click();
  await unreadNotificationResponse;
};


test.describe("As a taxpayer, I should be able to view unread notifications.", () => {
  test("Initiating test", checkUnreadNotification);
});

export default checkUnreadNotification;
