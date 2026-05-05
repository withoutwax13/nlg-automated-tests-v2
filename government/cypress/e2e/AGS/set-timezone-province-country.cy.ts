import selector from "../../fixtures/selector.json";

const setupIntercepts = () => {
  const interceptData = [
    {
      method: "GET",
      url: "https://**.amazonaws.com/municipalities/ActiveTaxAndFeesSubscriptions",
      alias: "loadMunicipalitiesData",
    },
    {
      method: "GET",
      url: "https://**.amazonaws.com/municipalities",
      alias: "municipalList",
    },
    {
      method: "GET",
      url: "https://**.amazonaws.com/subscriptions",
      alias: "subsList",
    },
    {
      method: "GET",
      url: "https://**.amazonaws.com/ReportsListInfo",
      alias: "addMunicipality",
    },
  ];
  interceptData.forEach((intercept) => {
    cy.intercept(intercept.method, intercept.url).as(intercept.alias);
  });
};

const loginAndViewMunicipalities = () => {
  cy.login({ accountType: "ags" });
  cy.get(selector.navigateMunicipality).click();
  cy.url().should("contain", "/municipalityApp/list/");
};

const verifyMunicipality = () => {
  cy.wait("@municipalList").its("response.statusCode").should("eq", 200);
  cy.get(selector.dataLink).contains("Municipalities").click();
  cy.get(selector.heading2Title).contains("Municipalities").should("exist");
};

const navigateToAddMunicipality = () => {
  cy.get(selector.addMunicipalityButton).click();
  cy.wait("@addMunicipality").its("response.statusCode").should("eq", 200);
  cy.get(selector.addingMuniForm).should("exist").and("be.visible");
  cy.get(selector.heading1Title)
    .contains("Create a new Municipality")
    .should("exist");
};

const updateCountry = () => {
  cy.get(selector.inputLabel).contains("Country").next().click();
  cy.get(selector.optionListContainer)
    .find(selector.optionList)
    .find(selector.optionItem)
    .contains("Canada")
    .click();
};

const updateProvince = () => {
  cy.get(selector.inputLabel).contains("Government Province").next().click();
  cy.get(selector.optionListContainer)
    .find(selector.optionList)
    .find(selector.optionItem)
    .contains("AB")
    .click();
};

const updateTimezone = () => {
  cy.get(selector.inputLabel).contains("Time Zone").next().click();
  cy.get(selector.optionListContainer)
    .find(selector.optionList)
    .find(selector.optionItem)
    .contains("America/Edmonton")
    .click();
};

const setTimezoneProvinceCountryNewMunicipality = () => {
  setupIntercepts();
  loginAndViewMunicipalities();
  verifyMunicipality();
  navigateToAddMunicipality();
  updateCountry();
  updateProvince();
  updateTimezone();
};

describe("As an AGS user, I want to set the time zone, province and country for a government", () => {
  it("Initiating test", setTimezoneProvinceCountryNewMunicipality);
});

export default setTimezoneProvinceCountryNewMunicipality;
