import { expect, Page, test } from '@playwright/test';
import selector from '../../fixtures/selector.json';
import { loginViaUi, waitForApiResponse } from '../../utils/Login';

const changeNotificationSetting = async (page: Page): Promise<void> => {
  await loginViaUi(page, 'taxpayer');

  const notificationIcon = page.locator(selector.notificationIcon).first();
  await expect(notificationIcon).toBeVisible();

  const taxpayerNotificationResponse = waitForApiResponse(page, {
    method: 'GET',
    urlIncludes: '/Notifications?notificationStatus=undefined',
  });

  await notificationIcon.click();

  expect((await taxpayerNotificationResponse).status()).toBe(200);
  await expect(page).toHaveURL(/\/NotificationsApp\/NotificationsList/);

  const settingsResponse = waitForApiResponse(page, {
    method: 'GET',
    urlIncludes: '/NotificationsSetting',
  });

  await expect(page.locator(selector.settingButton).first()).toBeVisible();
  await page.locator(selector.settingButton).first().click();

  expect((await settingsResponse).status()).toBe(200);

  const updateResponse = waitForApiResponse(page, {
    method: 'PUT',
    urlIncludes: '/NotificationsSetting',
  });

  await expect(page.locator(selector.updateButton).first()).toBeVisible();
  await page.locator(selector.updateButton).first().click();

  expect((await updateResponse).status()).toBe(200);
};

test.describe(
  'As a taxpayer, I should be able to change notifications settings.',
  () => {
    test('Initiating test', async ({ page }) => {
      await changeNotificationSetting(page);
    });
  },
);

export default changeNotificationSetting;
