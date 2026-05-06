import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
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
const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
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

test.describe("As a municipal, I should be able to download the PDF of specific filing by selecting the PDF image icon", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login({ accountType: "ags" });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 62803",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement();
    legacy.wrap(await agsFilingGrid.getElement().rows().count()).as("rowsLength");
    legacy.get("").then(async (rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 62803"]
        );
      }
    });
    await logout();

    await Login.login({ accountType: "taxpayer", accountIndex: 5, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 62803");
    form.clickNextbutton(false);
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
      ;
    legacy.wrap(await applicationConfirmation.getElement().referenceIdData().innerText()).as("referenceId");
    applicationConfirmation.clickCloseButton();
    await logout();

    legacy.get("").then(async (referenceId) => {
      await Login.login({ accountType: "municipal", accountIndex: 1, notFirstLogin: true });
      municipalFilingGrid.init();
      municipalFilingGrid.toggleActionButton(
        "Download",
        "Reference ID",
        String(referenceId)
      );
    });
  });
});