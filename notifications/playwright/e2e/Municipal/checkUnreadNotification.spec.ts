import { test, expect } from '@playwright/test';
import selector from '../../fixtures/selector.json';

const checkUnreadNotification = () => {
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("municipalNotification");
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("municipalUnreadNotification");

  cy.login({ accountType: "municipal" });
  cy.get(selector.notificationIcon).should('exist');
  cy.get(selector.notificationIcon).click();

  cy.wait("@municipalNotification").its("response.statusCode").should("eq", 200);
  cy.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the Switch for unread notifications only
  cy.get(selector.switchUnreadNotif).should('exist').click()
  //Verify the xhr that it shows the unread notifs
  cy.wait("@municipalUnreadNotification").its("response.statusCode").should("eq", 200);
};

test.describe("As a municipal, I should be able to view unread notifications.", () => {
  test("Initiating test", checkUnreadNotification);
});

export default checkUnreadNotification;
