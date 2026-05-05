import { test, expect } from '../../support/pwtest';
import selector from "../../fixtures/selector.json";
const setupIntercepts = () => {
  pw.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  pw.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  pw.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");
};

const loginAndViewMunicipalities = () => {
  pw.login({ accountType: "ags" });
  pw.get(selector.navigateMunicipality).click();
  pw.url().should('contain', '/municipalityApp/list/');
};

const verifyMunicipalities = () => {
  pw.wait("@municipalList").its("response.statusCode").should("eq", 200);
  pw.get(selector.dataLink).contains("Municipalities").click();
  pw.get(selector.heading2Title).contains("Municipalities").should('exist');
};
const viewmunicipalities = () => {
  setupIntercepts();
  loginAndViewMunicipalities();
  verifyMunicipalities();
};

test.describe("As a government user, I want to be able to view the list of Municipalities", () => {
  test("Initiating test", viewmunicipalities);
});

export default viewmunicipalities;
