import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";

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

test.describe("As a taxpayer, I should be able to reattempt a declined filing.", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "ags", accountIndex: 4 });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 40337",
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
          ["Location DBA", "Arrakis Spice Company 40337"]
        );
      }
    });
    await logout();

    await login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 40337");
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
      await login({ accountType: "ags", accountIndex: 4, notFirstLogin: true });
      agsFilingGrid.init();
      agsFilingGrid.updateStatus(
        "Declined",
        "Reference ID",
        String(referenceId)
      );
      await logout();

      await login({ accountType: "taxpayer", notFirstLogin: true });
      taxpayerFilingGrid.init();
      taxpayerFilingGrid.toggleActionButton(
        "Reattempt Payment",
        "Reference ID",
        String(referenceId)
      );
      payment.clickPayNowButton();
      payment.clickSavedPaymentMethods();
      payment.selectSavedPaymentMethod(0);
      payment.clickTermsAndConditionsCheckbox();
      payment.clickFinishAndPayButton();
      applicationConfirmation.clickCloseButton();
      taxpayerFilingGrid.init();
      taxpayerFilingGrid.getDataOfColumn("Filing Status", "Reference ID", String(referenceId), "newFilingStatus");
      legacy.get("").then(async (newFilingStatus) => {
        expect(newFilingStatus).toBe("Pending");
      });
    });
  });
});
