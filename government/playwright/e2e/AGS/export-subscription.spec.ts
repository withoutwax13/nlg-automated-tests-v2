import { test, expect } from '@playwright/test';
import viewSubscription from "../../helpers/view-subscription";

import selector from "../../fixtures/selector.json";

const exportSubscription = () => {
  // Intercept the network request for completing delinquency reports
  
  viewSubscription();

  // Find and click the "Export" button
  cy.get(selector.button)
    .contains("Export")
    .should("exist")
    .and("be.enabled")
    .click();
  
};

test.describe("As a government user, I want to be able to export the list of Subscriptions", () => {
  test("Initiating test", exportSubscription);
});

export default exportSubscription;
