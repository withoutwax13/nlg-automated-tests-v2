import { test, expect } from '../../support/pwtest';
import selector from "../../fixtures/selector.json";

const setupIntercepts = () => {
  pw.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  pw.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  pw.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
};

const loginAndViewSubscription = () => {
  pw.login({ accountType: "ags" });
  pw.get(selector.navigateMunicipality).click();
  pw.url().should('contain', '/municipalityApp/list/');
};

const verifySubscriptions = () => {
  pw.wait("@subsList").its("response.statusCode").should("eq", 200);
  pw.get(selector.dataLink).contains("Subscriptions").click();
  pw.get(selector.heading2Title).contains("Subscriptions").should('exist');
};
const viewSubsription = () => {
  setupIntercepts();
  loginAndViewSubscription();
  verifySubscriptions();
};

test.describe("As a government user, I want to be able to view the list of Subscriptions", () => {
  test("Initiating test", viewSubsription);
});

export default viewSubsription;
