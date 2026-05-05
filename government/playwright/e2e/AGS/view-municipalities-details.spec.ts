import { test, expect } from '@playwright/test';
import selector from "../../fixtures/selector.json";

const setupIntercepts = () => {
  cy.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  cy.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  cy.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
};

const loginAndViewMunicipalities = () => {
  cy.login({ accountType: "ags" });
  cy.get('[href="/municipalityApp/list/:tab"] > [data-cy="drawer-item"]').click();
  cy.url().should('contain', '/municipalityApp/list/');
};

const verifyMunicipalities = () => {
  cy.wait("@municipalList").its("response.statusCode").should("eq", 200);
  cy.get(selector.dataLink).contains("Municipalities").click();
  cy.get(selector.heading2Title).contains("Municipalities").should('exist');
};

const interactMunicipalitiesDetials = () => {
  cy.get(selector.detailsIcon).should('exist')
    .click();
  cy.url().should('contain', "/municipalityApp/view/")
  cy.get(selector.heading2Title).contains("Basic information").should('exist').and('be.visible')

};
const viewmunicipalitiesDetials = () => {
  setupIntercepts();
  loginAndViewMunicipalities();
  verifyMunicipalities();
  interactMunicipalitiesDetials();
};

test.describe("As a government user, I want to be able to view the specific details of Municipalities", () => {
  test("Initiating test", viewmunicipalitiesDetials);
});

export default viewmunicipalitiesDetials;
