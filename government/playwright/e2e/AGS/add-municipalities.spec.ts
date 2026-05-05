import { test, expect } from '../../support/pwtest';
import selector from "../../fixtures/selector.json";

const setupIntercepts = () => {
  cy.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  cy.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  cy.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
  cy.intercept("GET", "https://**.amazonaws.com/ReportsListInfo").as("addMunicipality");
};

const loginAndViewMunicipalities = () => {
  cy.login({ accountType: "ags" });
  cy.get(selector.navigateMunicipality).click();
  cy.url().should('contain', '/municipalityApp/list/');
};

const verifyMunicipality = () => {
  cy.wait("@municipalList").its("response.statusCode").should("eq", 200);
  cy.get(selector.dataLink).contains("Municipalities").click();
  cy.get(selector.heading2Title).contains("Municipalities").should('exist');
};

const addMunicipalities = () => {
  cy.get(selector.addMunicipalityButton).click();
  cy.wait("@addMunicipality").its("response.statusCode").should("eq", 200);
  cy.get(selector.addingMuniForm).should('exist').and('be.visible');
  cy.get(selector.heading1Title).contains("Create a new Municipality").should('exist');
};

const viewmunicipalities = () => {
  setupIntercepts();
  loginAndViewMunicipalities();
  verifyMunicipality();
  addMunicipalities();
};

test.describe("As a government user, I want to be able to add a Municipality", () => {
  test("Initiating test", viewmunicipalities);
});

export default viewmunicipalities;
