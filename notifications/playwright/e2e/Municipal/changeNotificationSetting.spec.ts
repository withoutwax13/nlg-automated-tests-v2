import { test, expect } from '../../support/pwtest';
import selector from '../../fixtures/selector.json';

const changeNotificationSetting = () => {
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("municipalNotification");
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("municipalUnreadNotification");
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/NotificationsSetting"
  ).as("changeSetting");
  pw.intercept(
    "PUT",
    "https://**.amazonaws.com/NotificationsSetting"
  ).as("updateSetting")

  pw.login({ accountType: "municipal" });

  //Click the notification button
  pw.get(selector.notificationIcon).should('exist');
  pw.get(selector.notificationIcon).click();

  pw.wait("@municipalNotification").its("response.statusCode").should("eq", 200);
  pw.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the setting button
  pw.get(selector.settingButton).should('exist').click();
  pw.wait("@changeSetting").its("response.statusCode").should("eq", 200);

  //Click the update button
  pw.get(selector.updateButton).click()
  pw.wait("@updateSetting").its("response.statusCode").should("eq", 200);
};

test.describe("As a municipal, I should be able to change notifications settings.", () => {
  test("Initiating test", changeNotificationSetting);
});

export default changeNotificationSetting;
