import { test, expect } from '../../support/pwtest';
import selector from '../../fixtures/selector.json';

const checkUnreadNotification = () => {
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("taxpayerNotification");
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("taxpayerUnreadNotification");

  pw.login({ accountType: "taxpayer" });
  pw.get(selector.notificationIcon).should('exist');
  pw.get(selector.notificationIcon).click();

  pw.wait("@taxpayerNotification").its("response.statusCode").should("eq", 200);
  pw.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the Switch for unread notifications only
  pw.get(selector.switchUnreadNotif).should('exist').click()
  //Verify the xhr that it shows the unread notifs
  pw.wait("@taxpayerUnreadNotification").its("response.statusCode").should("eq", 200);
};

test.describe("As a taxpayer, I should be able to view unread notifications.", () => {
  test("Initiating test", checkUnreadNotification);
});

export default checkUnreadNotification;
