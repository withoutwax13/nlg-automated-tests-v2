import { test, expect } from '@playwright/test';
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const applicationConfirmation = new ApplicationConfirmation();
const filing = new Filing({ isResumingDraftApplication: false });
const taxpayerFilingGrid = new FilingGrid({ userType: "taxpayer" });
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

test.describe("As a taxpayer, I should be able to submit a zero payment filing.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 34754",
      "text",
      "Contains"
    );
    agsFilingGrid.filterColumn(
      "Form Name",
      "ZERO PAYMENT",
      "multi-select"
    );
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    cy.get("@rowsLength").then((rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "ZERO PAYMENT", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 34754"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("ZERO PAYMENT");
    filing.selectBusinessToFile("Arrakis Spice Company 34754");
    form.clickNextbutton(false);
    form.enterBasicInformation();
    form.clickNextbutton();
    form.enterTaxInformation();
    form.clickNextbutton();
    form.enterPreparerInformation();
    form.clickNextbutton();
    formPreview.clickSubmitButton();
    applicationConfirmation
      .getElement()
      .referenceIdData()
      .invoke("text")
      .then((referenceId) => {
        cy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton(false);

    cy.get("@referenceId").then((referenceId) => {
      taxpayerFilingGrid.init();
      taxpayerFilingGrid.toggleActionButton(
        "View",
        "Reference ID",
        String(referenceId)
      );
    });
  });
});
