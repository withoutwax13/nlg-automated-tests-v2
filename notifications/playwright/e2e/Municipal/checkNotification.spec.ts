import { expect, Page, test } from '@playwright/test';
import selector from '../../fixtures/selector.json';
import { loginViaUi, waitForApiResponse } from '../../utils/Login';

const checkNotifications = async (page: Page): Promise<void> => {
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
};

test.describe('As a municipal, I should be able to view notifications.', () => {
  test('Initiating test', async ({ page }) => {
    await checkNotifications(page);
  });
});

export default checkNotifications;
