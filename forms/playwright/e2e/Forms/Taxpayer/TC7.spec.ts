import { expect, test } from "@playwright/test";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";
import Business from "../../../objects/Business";
import Filing from "../../../objects/Filing";
import FilingGrid from "../../../objects/FilingGrid";
import Form from "../../../objects/Form";
import FormPreview from "../../../objects/FormPreview";
import Payment from "../../../objects/Payment";
import { initTestRuntime, login, logout, textOf, waitForLoading } from "../../../support/runtime";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filing = new Filing({ isResumingDraftApplication: false });
const applicationConfirmation = new ApplicationConfirmation();
const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const business = new Business();

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

const deleteBusiness = async (businessDba: string) => {
  await business.init();
  await business.filterColumn("DBA", businessDba, "text", "Contains");
  await waitForLoading();
  const businessRowsLength = await business.getElement().rows().count();
  await business.clickClearAllFiltersButton();
  if (businessRowsLength > 0) {
    await business.deleteBusiness(businessDba);
  }
};

test.describe("As a taxpayer, I should be able to submit a tax form for a non-listed business.", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 9 });
    await agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Test DBA #4884",
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
        ["Location DBA", "Test DBA #4884"]
      );
    }
    await logout();

    await login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Food and Beverage");
    await filing.clickAddBusinessButton();
    await business.addBusinessOnAccount("Test DBA #4884");

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

    await login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    await deleteBusiness("Test DBA #4884");
  });
});
