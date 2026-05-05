import { expect, test, type Page, type Response } from "@playwright/test";
import selector from "../../fixtures/selector.json";
import { login, waitForApiResponse } from "../../utils/Login";

const changeNotificationSetting = async ({ page }: { page: Page }) => {
  await login(page, { accountType: "taxpayer" });

  const notificationResponse = page.waitForResponse(
    (response: Response) =>
      response.request().method() === "GET" &&
      response.url().includes("/Notifications?notificationStatus=undefined")
  );
  await expect(page.locator(selector.notificationIcon)).toBeVisible();
  await page.locator(selector.notificationIcon).click();
  expect((await notificationResponse).status()).toBe(200);
  await expect(page).toHaveURL(/\/NotificationsApp\/NotificationsList/);

  const changeSettingResponse = waitForApiResponse(page, {
    method: "GET",
    urlPart: "/NotificationsSetting",
  });
  await expect(page.locator(selector.settingButton)).toBeVisible();
  await page.locator(selector.settingButton).click();
  await changeSettingResponse;

  const updateSettingResponse = waitForApiResponse(page, {
    method: "PUT",
    urlPart: "/NotificationsSetting",
  });
  await page.locator(selector.updateButton).click();
  await updateSettingResponse;
};







test.describe("As a taxpayer, I should be able to change notifications settings.", () => {
  test("Initiating test", changeNotificationSetting);
});

export default changeNotificationSetting;
