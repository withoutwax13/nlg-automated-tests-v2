import selector from '../../fixtures/selector.json';

const checkNotifications = () => {
  cy.intercept(
    "GET",
    "https://**.amazonaws.com//filings?municipalityId=undefined"
  ).as("taxpayerFilings");
  cy.intercept(
    "GET",
    "https://**.amazonaws.com/Notifications?notificationStatus=undefined"
  ).as("taxpayerNotification");
  
  cy.login({ accountType: "taxpayer" });
  cy.get(selector.notificationIcon).should('exist');
  cy.get(selector.notificationIcon).click();

  cy.wait("@taxpayerNotification").its("response.statusCode").should("eq", 200);

  cy.url().should('contain', "/NotificationsApp/NotificationsList");
};

describe("As a taxpayer, I should be able to view notifications.", () => {
  it("Initiating test", checkNotifications);
});

export default checkNotifications;
