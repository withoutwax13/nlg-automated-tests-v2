import selector from '../../fixtures/selector.json';

const checkUnreadNotification = () => {
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("taxpayerNotification");
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=UNREAD"
  ).as("taxpayerUnreadNotification");

  cy.login({ accountType: "taxpayer" });
  cy.get(selector.notificationIcon).should('exist');
  cy.get(selector.notificationIcon).click();

  cy.wait("@taxpayerNotification").its("response.statusCode").should("eq", 200);
  cy.url().should('contain', "/NotificationsApp/NotificationsList");

  //Click the Switch for unread notifications only
  cy.get(selector.switchUnreadNotif).should('exist').click()
  //Verify the xhr that it shows the unread notifs
  cy.wait("@taxpayerUnreadNotification").its("response.statusCode").should("eq", 200);
};

describe("As a taxpayer, I should be able to view unread notifications.", () => {
  it("Initiating test", checkUnreadNotification);
});

export default checkUnreadNotification;
