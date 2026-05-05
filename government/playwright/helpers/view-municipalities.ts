import selector from "../fixtures/selector.json";

export default function viewMunicipalities() {
  pw.intercept("GET", "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions").as("loadMunicipalitiesData");
  pw.intercept("GET", "https://**.amazonaws.com/municipalities").as("municipalList");
  pw.intercept("GET", "https://**.amazonaws.com/subscriptions").as("subsList");

  pw.login({ accountType: "ags" });
  pw.get(selector.navigateMunicipality).click();
  pw.url().should('contain', '/municipalityApp/list/');

  pw.wait("@municipalList").its("response.statusCode").should("eq", 200);
  pw.get(selector.dataLink).contains("Municipalities").click();
  pw.get(selector.heading2Title).contains("Municipalities").should('exist');
}
