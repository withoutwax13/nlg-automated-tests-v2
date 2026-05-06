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

test.describe("As a taxpayer, I should be able to submit a zero payment filing.", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login({ accountType: "ags", accountIndex: 1 });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 34754",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "ZERO PAYMENT",
      "multi-select"
    );
    agsFilingGrid.getElement();
    legacy.wrap(await agsFilingGrid.getElement().rows().count()).as("rowsLength");
    legacy.get("").then(async (rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "ZERO PAYMENT", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 34754"]
        );
      }
    });
    await logout();

    await Login.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("ZERO PAYMENT");
    filing.selectBusinessToFile("Arrakis Spice Company 34754");
    form.clickNextbutton(false);
    form.enterBasicInformation();
    form.clickNextbutton();
    form.enterTaxInformation();
    form.clickNextbutton();
    form.enterPreparerInformation();
    form.clickNextbutton();
    formPreview.clickSubmitButton();
    applicationConfirmation
      .getElement()
      ;
    legacy.wrap(await applicationConfirmation.getElement().referenceIdData().innerText()).as("referenceId");
    applicationConfirmation.clickCloseButton(false);

    legacy.get("").then(async (referenceId) => {
      taxpayerFilingGrid.init();
      taxpayerFilingGrid.toggleActionButton(
        "View",
        "Reference ID",
        String(referenceId)
      );
    });
  });
});