import { test, expect } from '../../support/pwtest';
import selector from "../../fixtures/selector.json";

const setupIntercepts = () => {
  pw.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  pw.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  pw.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
  pw.intercept("GET", "https://**.amazonaws.com/ReportsListInfo").as("addMunicipality");
};

const loginAndViewMunicipalities = () => {
  pw.login({ accountType: "ags" });
  pw.get(selector.navigateMunicipality).click();
  pw.url().should('contain', '/municipalityApp/list/');
};

const verifyMunicipality = () => {
  pw.wait("@municipalList").its("response.statusCode").should("eq", 200);
  pw.get(selector.dataLink).contains("Municipalities").click();
  pw.get(selector.heading2Title).contains("Municipalities").should('exist');
};

const addMunicipalities = () => {
  pw.get(selector.addMunicipalityButton).click();
  pw.wait("@addMunicipality").its("response.statusCode").should("eq", 200);
  pw.get(selector.addingMuniForm).should('exist').and('be.visible');
  pw.get(selector.heading1Title).contains("Create a new Municipality").should('exist');
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
