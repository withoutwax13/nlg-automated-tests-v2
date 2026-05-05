import { test, expect } from '../../../support/pwtest';
import Form from "../../../objects/Form";
import FormPreview from "../../../objects/FormPreview";
import Payment from "../../../objects/Payment";
import Filing from "../../../objects/Filing";
import FilingGrid from "../../../objects/FilingGrid";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filing = new Filing({ isResumingDraftApplication: false });
const applicationConfirmation = new ApplicationConfirmation();
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

test.describe("As a taxpayer, I should not be able to submit to a closed business when submitting a form.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 7 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Sand Company 34855",
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
          ["Location DBA", "Arrakis Sand Company 34855"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", accountIndex: 5, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.getElements().businessSelectionDropdown().click();
    filing
      .getElements()
      .businessSelectionDropdown()
      .type("Arrakis Sand Company 34855");
    filing
      .getElements()
      .anyList()
      .contains("Arrakis Sand Company 34855")
      .should("not.exist");
  });
});
