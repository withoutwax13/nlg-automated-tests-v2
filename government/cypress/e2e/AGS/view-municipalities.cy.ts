import selector from "../../fixtures/selector.json";
const setupIntercepts = () => {
  cy.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  cy.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  cy.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
};

const loginAndViewMunicipalities = () => {
  cy.login({ accountType: "ags" });
  cy.get(selector.navigateMunicipality).click();
  cy.url().should('contain', '/municipalityApp/list/');
};

const verifyMunicipalities = () => {
  cy.wait("@municipalList").its("response.statusCode").should("eq", 200);
  cy.get(selector.dataLink).contains("Municipalities").click();
  cy.get(selector.heading2Title).contains("Municipalities").should('exist');
};
const viewmunicipalities = () => {
  setupIntercepts();
  loginAndViewMunicipalities();
  verifyMunicipalities();
};

describe("As a government user, I want to be able to view the list of Municipalities", () => {
  it("Initiating test", viewmunicipalities);
});

export default viewmunicipalities;
