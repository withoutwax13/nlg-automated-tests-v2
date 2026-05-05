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

test.describe("As a taxpayer, I should be able to submit a tax form for a listed business.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Test Trade Name 98068 1",
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
          ["Location DBA", "Test Trade Name 98068 1"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Test Trade Name 98068 1");
    form.clickNextbutton();
    form.enterBasicInformation();
    form.clickNextbutton();
    form.enterTaxInformation();
    form.clickNextbutton();
    form.enterPreparerInformation();
    form.clickNextbutton();
    formPreview.clickSubmitButton();
    payment.clickSavedPaymentMethods();
    payment.selectSavedPaymentMethod(0);
    payment.clickTermsAndConditionsCheckbox();
    payment.clickFinishAndPayButton();
    applicationConfirmation
      .getElement()
      .referenceIdData()
      .invoke("text")
      .then((referenceId) => {
        cy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    cy.logout();
  });
});
