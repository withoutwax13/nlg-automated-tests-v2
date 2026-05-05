import Filing from "../../../users/cypress/objects/Filing";
import Form from "../../../users/cypress/objects/Form";
import FormPreview from "../../../users/cypress/objects/FormPreview";
import Payment from "../../../users/cypress/objects/Payment";
import FilingGrid from "../../../users/cypress/objects/FilingGrid";
import ApplicationConfirmation from "../../../users/cypress/objects/ApplicationConfirmation";
import Profile from "../../../users/cypress/objects/Profile";

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

describe("As a Taxpayer user, I should be able to save and delete bank account information", () => {
  for (let i = 0; i < 10; i++) {
    it(`Initiating test for account ${i}`, () => {
      cy.login({ accountType: "ags" });
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
      cy.login({
        accountType: "taxpayer",
        accountIndex: i,
        notFirstLogin: true,
      });
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
    });
  }
});
