import { test, expect } from '../../support/pwtest';
import selector from '../../fixtures/selector.json';

const checkNotifications = () => {
  pw.intercept(
    "GET",
    "https://**.amazonaws.com//filings?municipalityId=undefined"
  ).as("taxpayerFilings");
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("municipalNotification");
  pw.login({ accountType: "municipal" });
  pw.get(selector.notificationIcon).should('exist');
  pw.get(selector.notificationIcon).click();

  pw.wait("@municipalNotification").its("response.statusCode").should("eq", 200);

  pw.url().should('contain', "/NotificationsApp/NotificationsList");
};

test.describe("As a municipal, I should be able to view notifications.", () => {
  test("Initiating test", checkNotifications);
});

export default checkNotifications;
