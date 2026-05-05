import { test, expect } from '../../support/pwtest';
import selector from '../../fixtures/selector.json';

const changeNotificationSetting = () => {
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("taxpayerNotification");
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("taxpayerUnreadNotification");
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/NotificationsSetting"
  ).as("changeSetting");
  cy.intercept(
    "PUT",
    "https://**.amazonaws.com/NotificationsSetting"
  ).as("updateSetting")

  cy.login({ accountType: "taxpayer" });

  //Click the notification button
  cy.get(selector.notificationIcon).should('exist');
  cy.get(selector.notificationIcon).click();

  cy.wait("@taxpayerNotification").its("response.statusCode").should("eq", 200);
  cy.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the setting button
  cy.get(selector.settingButton).should('exist').click();
  cy.wait("@changeSetting").its("response.statusCode").should("eq", 200);

  //Click the update button
  cy.get(selector.updateButton).click()
  cy.wait("@updateSetting").its("response.statusCode").should("eq", 200);
};

test.describe("As a taxpayer, I should be able to change notifications settings.", () => {
  test("Initiating test", changeNotificationSetting);
});

export default changeNotificationSetting;
