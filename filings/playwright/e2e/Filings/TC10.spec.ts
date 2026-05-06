import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const applicationConfirmation = new ApplicationConfirmation();
const filing = new Filing({ isResumingDraftApplication: false });
const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

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

test.describe("As a ags, I should be able to search filing list with data from its columns", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login({ accountType: "ags", accountIndex: 7 });
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
    const rowsLength = await agsFilingGrid.getElement(page).rows().count();
    if (rowsLength > 0) {
      await deleteMultipleFiling(
        rowsLength,
        ["Form Name", "Food and Beverage", "multi-select"],
        ["Location DBA", "Arrakis Spice Company 13685"]
      );
    }
    await logout();

    await Login.login({ accountType: "taxpayer", accountIndex: 3, notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Food and Beverage");
    await filing.selectBusinessToFile("Arrakis Spice Company 13685");
    await form.clickNextbutton(page, false);
    await form.enterBasicInformation(page);
    await form.clickNextbutton(page);
    await form.enterTaxInformation(page);
    await form.clickNextbutton(page);
    await form.enterPreparerInformation(page);
    await form.clickNextbutton(page);
    await formPreview.clickSubmitButton(page);
    await payment.clickSavedPaymentMethods(page);
    await payment.selectSavedPaymentMethod(page, 0);
    await payment.clickTermsAndConditionsCheckbox(page);
    await payment.clickFinishAndPayButton(page);
    const referenceId = await applicationConfirmation.getElement(page).referenceIdData().innerText();
    await applicationConfirmation.clickCloseButton(page);
    await logout();

    await Login.login({ accountType: "ags", accountIndex: 7, notFirstLogin: true });
    await agsFilingGrid.init();
    await agsFilingGrid.searchFiling(String(referenceId).trim());
    expect(await agsFilingGrid.getElement(page).rows().count()).toBe(1);
  });
});