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

test.describe.skip("As a Taxpayer user, I should be able to save and delete credit/debit cards information", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 2 });
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
    pw.get("@rowsLength").then((rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Test Trade Name 98068 1"]
        );
      }
    });
    pw.logout();
    pw.login({ accountType: "taxpayer", accountIndex: 2, notFirstLogin: true });
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
    payment.addDebitCreditCardDetails({
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "Chicago",
      state: "IL",
      postalCode: "12345",
      cardNumber: "4111111111111111",
      expirationDate: "02/27",
      cvv: "123",
    });
    payment.clickSaveThisPaymentMethodForFutureUseCheckbox();
    payment.clickTermsAndConditionsCheckbox();
    payment.clickFinishAndPayButton();
    confirmation.clickCloseButton();
    profile.init();
    profile.clickSavedCreditDebitCardsAccordion();
    profile
      .getElement()
      .savedCreditDebitCardItems()
      .its("length")
      .then((savedCreditDebitCardItems) => {
        pw.wrap(savedCreditDebitCardItems).as("savedCreditDebitCardItems");
      });
    profile.deleteSavedPaymentMethod("card", 0);
    profile
      .getElement()
      .savedCreditDebitCardItems()
      .its("length")
      .then((currentLength) => {
        pw.get("@savedCreditDebitCardItems").then(
          (savedCreditDebitCardItems) => {
            expect(Number(currentLength)).to.not.eq(
              Number(savedCreditDebitCardItems)
            );
          }
        );
      });
  });
});
