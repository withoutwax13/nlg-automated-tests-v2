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
  ).as("taxpayerNotification");
  
  pw.login({ accountType: "taxpayer" });
  pw.get(selector.notificationIcon).should('exist');
  pw.get(selector.notificationIcon).click();

  pw.wait("@taxpayerNotification").its("response.statusCode").should("eq", 200);

  pw.url().should('contain', "/NotificationsApp/NotificationsList");
};

test.describe("As a taxpayer, I should be able to view notifications.", () => {
  test("Initiating test", checkNotifications);
});

export default checkNotifications;
