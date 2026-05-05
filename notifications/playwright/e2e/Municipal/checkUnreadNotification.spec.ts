import { test, expect } from '../../support/pwtest';
import selector from '../../fixtures/selector.json';

const checkUnreadNotification = () => {
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("municipalNotification");
  pw.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("municipalUnreadNotification");

  pw.login({ accountType: "municipal" });
  pw.get(selector.notificationIcon).should('exist');
  pw.get(selector.notificationIcon).click();

  pw.wait("@municipalNotification").its("response.statusCode").should("eq", 200);
  pw.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the Switch for unread notifications only
  pw.get(selector.switchUnreadNotif).should('exist').click()
  //Verify the xhr that it shows the unread notifs
  pw.wait("@municipalUnreadNotification").its("response.statusCode").should("eq", 200);
};

test.describe("As a municipal, I should be able to view unread notifications.", () => {
  test("Initiating test", checkUnreadNotification);
});

export default checkUnreadNotification;
