import { expect, test } from "@playwright/test";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";
import Filing from "../../../objects/Filing";
import FilingGrid from "../../../objects/FilingGrid";
import Form from "../../../objects/Form";
import FormPreview from "../../../objects/FormPreview";
import Payment from "../../../objects/Payment";
import { initTestRuntime, login, logout, textOf } from "../../../support/runtime";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filing = new Filing({ isResumingDraftApplication: false });
const applicationConfirmation = new ApplicationConfirmation();
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

test.describe("As a taxpayer, I should be able to submit a tax form for a listed business.", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 8 });
    await agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Test Trade Name 98068 1",
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
        ["Location DBA", "Test Trade Name 98068 1"]
      );
    }
    await logout();

    await login({ accountType: "taxpayer", notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Food and Beverage");
    await filing.selectBusinessToFile("Test Trade Name 98068 1");
    await form.clickNextbutton();
    await form.enterBasicInformation();
    await form.clickNextbutton();
    await form.enterTaxInformation();
    await form.clickNextbutton();
    await form.enterPreparerInformation();
    await form.clickNextbutton();
    await formPreview.clickSubmitButton();
    await payment.clickSavedPaymentMethods();
    await payment.selectSavedPaymentMethod(0);
    await payment.clickTermsAndConditionsCheckbox();
    await payment.clickFinishAndPayButton();
    const referenceId = await textOf(
      applicationConfirmation.getElement().referenceIdData()
    );
    expect(referenceId).not.toBe("");
    await applicationConfirmation.clickCloseButton();
    await logout();
  });
});
