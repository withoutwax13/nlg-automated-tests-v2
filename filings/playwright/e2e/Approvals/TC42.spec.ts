import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
import ApprovalGrid from "../../objects/ApprovalGrid";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const agsApprovalGrid = new ApprovalGrid({ userType: "ags" });
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

test.describe.skip("As an AGS user, I should be able to view approval list page of a Municipality.", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Test Trade Name 50363 1",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    legacy.get("").then(async (rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Test Trade Name 50363 1"]
        );
      }
    });
    await logout();

    await Login.login({ accountType: "taxpayer", accountIndex: 8, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Test Trade Name 50363 1");
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
        legacy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    taxpayerFilingGrid.init();
    legacy.get("").then(async (referenceId) => {
      await logout();
      await Login.login({ accountType: "ags", accountIndex: 8, notFirstLogin: true });
      agsFilingGrid.init();
      agsFilingGrid.updateStatus("Funded", "Reference ID", String(referenceId));
      agsApprovalGrid.init();
    });
  });
});