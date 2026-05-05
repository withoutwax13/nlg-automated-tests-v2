import { expect, Page, test } from '@playwright/test';
import selector from '../../fixtures/selector.json';
import { loginViaUi, waitForApiResponse } from '../../utils/Login';

const checkUnreadNotification = async (page: Page): Promise<void> => {
  await loginViaUi(page, 'municipal');

  const notificationIcon = page.locator(selector.notificationIcon).first();
  await expect(notificationIcon).toBeVisible();

  const municipalNotificationResponse = waitForApiResponse(page, {
    method: 'GET',
    urlIncludes: '/Notifications?notificationStatus=undefined',
  });

  await notificationIcon.click();

  expect((await municipalNotificationResponse).status()).toBe(200);
  await expect(page).toHaveURL(/\/NotificationsApp\/NotificationsList/);

  const municipalUnreadNotificationResponse = waitForApiResponse(page, {
    method: 'GET',
    urlIncludes: '/Notifications?notificationStatus=UNREAD',
  });

  await expect(page.locator(selector.switchUnreadNotif).first()).toBeVisible();
  await page.locator(selector.switchUnreadNotif).first().click();

  expect((await municipalUnreadNotificationResponse).status()).toBe(200);
};

test.describe(
  'As a municipal, I should be able to view unread notifications.',
  () => {
    test('Initiating test', async ({ page }) => {
      await checkUnreadNotification(page);
    });
  },
);

export default checkUnreadNotification;
