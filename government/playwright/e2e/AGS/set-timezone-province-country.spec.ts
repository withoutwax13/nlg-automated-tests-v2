import { test, expect } from '../../support/pwtest';
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
    pw.intercept(intercept.method, intercept.url).as(intercept.alias);
  });
};

const loginAndViewMunicipalities = () => {
  pw.login({ accountType: "ags" });
  pw.get(selector.navigateMunicipality).click();
  pw.url().should("contain", "/municipalityApp/list/");
};

const verifyMunicipality = () => {
  pw.wait("@municipalList").its("response.statusCode").should("eq", 200);
  pw.get(selector.dataLink).contains("Municipalities").click();
  pw.get(selector.heading2Title).contains("Municipalities").should("exist");
};

const navigateToAddMunicipality = () => {
  pw.get(selector.addMunicipalityButton).click();
  pw.wait("@addMunicipality").its("response.statusCode").should("eq", 200);
  pw.get(selector.addingMuniForm).should("exist").and("be.visible");
  pw.get(selector.heading1Title)
    .contains("Create a new Municipality")
    .should("exist");
};

const updateCountry = () => {
  pw.get(selector.inputLabel).contains("Country").next().click();
  pw.get(selector.optionListContainer)
    .find(selector.optionList)
    .find(selector.optionItem)
    .contains("Canada")
    .click();
};

const updateProvince = () => {
  pw.get(selector.inputLabel).contains("Government Province").next().click();
  pw.get(selector.optionListContainer)
    .find(selector.optionList)
    .find(selector.optionItem)
    .contains("AB")
    .click();
};

const updateTimezone = () => {
  pw.get(selector.inputLabel).contains("Time Zone").next().click();
  pw.get(selector.optionListContainer)
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

test.describe("As an AGS user, I want to set the time zone, province and country for a government", () => {
  test("Initiating test", setTimezoneProvinceCountryNewMunicipality);
});

export default setTimezoneProvinceCountryNewMunicipality;
