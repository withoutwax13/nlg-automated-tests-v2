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

const govApprovalGrid = new ApprovalGrid({ userType: "municipal" });
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

test.describe("As a government user, I want to be able to see message of an approved filing in approval list", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login({ accountType: "ags", accountIndex: 3 });
    agsFilingGrid.init();
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
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    legacy.get("").then(async (rowsLength) => {
      if(Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 13685"]
        );
      }
    });
    await logout();

    await Login.login({ accountType: "taxpayer", accountIndex: 5, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 13685");
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
      .referenceIdData()
      .invoke("text")
      .then((referenceId) => {
        legacy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    taxpayerFilingGrid.init();
    legacy.get("").then(async (referenceId) => {
      await logout();
      await Login.login({ accountType: "ags", accountIndex: 5, notFirstLogin: true });
      agsFilingGrid.init();
      agsFilingGrid.updateStatus("Funded", "Reference ID", String(referenceId));
      await logout();
      await Login.login({ accountType: "municipal", accountIndex: 2, notFirstLogin: true });
      govApprovalGrid.init();
      govApprovalGrid.selectRowToApprove("Reference ID", String(referenceId));
      govApprovalGrid.init();
      govApprovalGrid.getElementOfColumn(
        "Message",
        "Reference ID",
        String(referenceId),
        "message"
      );
      legacy.get("").then(async (message) => {
        legacy.wrap(message).click();
        govApprovalGrid.getElement().anyModal().assert("be.visible");
        govApprovalGrid
          .getElement()
          .anyModal()
          .assert("contain.text", "Approved");
      });
    });
  });
});