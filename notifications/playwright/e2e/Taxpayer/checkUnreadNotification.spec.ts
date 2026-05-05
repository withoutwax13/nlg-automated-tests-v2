import { expect, Page, test } from '@playwright/test';
import selector from '../../fixtures/selector.json';
import { loginViaUi, waitForApiResponse } from '../../utils/Login';

const checkUnreadNotification = async (page: Page): Promise<void> => {
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

  const taxpayerUnreadNotificationResponse = waitForApiResponse(page, {
    method: 'GET',
    urlIncludes: '/Notifications?notificationStatus=UNREAD',
  });

  await expect(page.locator(selector.switchUnreadNotif).first()).toBeVisible();
  await page.locator(selector.switchUnreadNotif).first().click();

  expect((await taxpayerUnreadNotificationResponse).status()).toBe(200);
};

test.describe(
  'As a taxpayer, I should be able to view unread notifications.',
  () => {
    test('Initiating test', async ({ page }) => {
      await checkUnreadNotification(page);
    });
  },
);

export default checkUnreadNotification;
