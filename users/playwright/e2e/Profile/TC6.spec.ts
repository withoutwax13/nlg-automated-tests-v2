import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import FilingGrid from "../../objects/FilingGrid";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Profile from "../../objects/Profile";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filing = new Filing({ isResumingDraftApplication: false });
const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const confirmation = new ApplicationConfirmation();
const profile = new Profile();

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

test.describe.skip("As a Taxpayer user, I should be able to save and delete bank account information", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 13685",
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
          ["Location DBA", "Arrakis Spice Company 13685"]
        );
      }
    });
    cy.logout();
    cy.login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 13685");
    form.clickNextbutton();
    form.enterBasicInformation();
    form.clickNextbutton();
    form.enterTaxInformation();
    form.clickNextbutton();
    form.enterPreparerInformation();
    form.clickNextbutton();
    formPreview.clickSubmitButton();
    payment.clickNewPaymentMethod();
    payment.addBankAccountDetails({
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "Chicago",
      state: "IL",
      postalCode: "12345",
      bankRoutingNumber: "021000021",
      bankAccountNumber: "111111111111",
    });
    payment.clickSaveThisPaymentMethodForFutureUseCheckbox();
    payment.clickTermsAndConditionsCheckbox();
    payment.clickFinishAndPayButton();
    confirmation.clickCloseButton();
    profile.init();
    profile.clickSavedBankAccountsAccordion();
    profile
      .getElement()
      .savedBankAccountItems()
      .its("length")
      .then((savedBankAccountsLength) => {
        cy.wrap(savedBankAccountsLength).as("savedBankAccountsLength");
      });
    profile.deleteSavedPaymentMethod("bank", 0);
    profile
      .getElement()
      .savedBankAccountItems()
      .its("length")
      .then((currentLength) => {
        cy.get("@savedBankAccountsLength").then((savedBankAccountsLength) => {
          expect(Number(currentLength)).to.not.eq(
            Number(savedBankAccountsLength)
          );
        });
      });
  });
});
