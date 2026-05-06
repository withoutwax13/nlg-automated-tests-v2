import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import FilingGrid from "../../objects/FilingGrid";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Profile from "../../objects/Profile";
import { bindRuntime, login, logout } from "../../support/runtime";
import Login from "../../utils/Login";

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

const deleteMultipleFiling = async (
  count: number,
  filterParams: [string, string, string?, string?],
  filingParams: [string, string]
) => {
  await agsFilingGrid.clickClearAllFiltersButton();
  await agsFilingGrid.filterColumn(...filterParams);
  await agsFilingGrid.deleteFiling(filingParams[0], filingParams[1]);
  if (count > 1) {
    await deleteMultipleFiling(count - 1, filterParams, filingParams);
  }
};

test.describe.skip("As a Taxpayer user, I should be able to save and delete bank account information", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);

    await Login.login({ accountType: "ags", accountIndex: 1 });
    await agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 13685",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    const rowsLength = await agsFilingGrid.getElement().rows().count();
    if (rowsLength > 0) {
      await deleteMultipleFiling(
        rowsLength,
        ["Form Name", "Food and Beverage", "multi-select"],
        ["Location DBA", "Arrakis Spice Company 13685"]
      );
    }

    await logout();
    await Login.login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Food and Beverage");
    await filing.selectBusinessToFile("Arrakis Spice Company 13685");
    await form.clickNextbutton();
    await form.enterBasicInformation();
    await form.clickNextbutton();
    await form.enterTaxInformation();
    await form.clickNextbutton();
    await form.enterPreparerInformation();
    await form.clickNextbutton();
    await formPreview.clickSubmitButton();
    await payment.clickNewPaymentMethod();
    await payment.addBankAccountDetails({
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "Chicago",
      state: "IL",
      postalCode: "12345",
      bankRoutingNumber: "021000021",
      bankAccountNumber: "111111111111",
    });
    await payment.clickSaveThisPaymentMethodForFutureUseCheckbox();
    await payment.clickTermsAndConditionsCheckbox();
    await payment.clickFinishAndPayButton();
    await confirmation.clickCloseButton();
    await profile.init();
    await profile.clickSavedBankAccountsAccordion();
    const savedBankAccountsLength = await profile.getElement().savedBankAccountItems().count();
    await profile.deleteSavedPaymentMethod("bank", 0);
    const currentLength = await profile.getElement().savedBankAccountItems().count();

    expect(currentLength).not.toBe(savedBankAccountsLength);
  });
});