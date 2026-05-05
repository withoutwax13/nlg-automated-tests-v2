import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";

const taxpayerFilingGrid = new FilingGrid({
  userType: "taxpayer",
});
const filing = new Filing({ isResumingDraftApplication: false });
const form = new Form();
const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const deleteMultipleFiling = (
  count: number,
  filterParams: [string, string, string?, string?],
  filingParams: [string, string]
) => {
  agsFilingGrid.clickClearAllFiltersButton();
  agsFilingGrid.filterColumn(...filterParams);
  agsFilingGrid.deleteFiling(filingParams[0], filingParams[1]);
  if (count > 1) {
    deleteMultipleFiling(count - 1, filterParams, filingParams);
  }
};

test.describe("As a taxpayer, I should be able to resume a draft filing.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 5 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 40337",
      "text",
      "Contains"
    );
    agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    cy.get("@rowsLength").then((rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 40337"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 40337");
    form.clickNextbutton(false);
    form.saveAndCloseFiling();

    taxpayerFilingGrid.init();
    taxpayerFilingGrid.filterColumn(
      "Filing Status",
      "Draft",
      "multi-select"
    );
    taxpayerFilingGrid.toggleActionButton("Resume", "Location DBA", "Arrakis Spice Company 40337");
    cy.url().should("include", "/filingApp/filings");
  });
});
