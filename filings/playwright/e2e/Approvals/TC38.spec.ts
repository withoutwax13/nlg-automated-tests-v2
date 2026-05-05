import { test, expect } from '../../support/pwtest';
import ApprovalGrid from "../../objects/ApprovalGrid";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";

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

test.describe("As a government user, I want to be able to see message of an rejected filing in approval list", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 4 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 13685",
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
      if(Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 13685"]
        );
      }
    });
    pw.logout();

    pw.login({ accountType: "taxpayer", accountIndex: 6, notFirstLogin: true });
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
        pw.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    taxpayerFilingGrid.init();
    pw.get("@referenceId").then((referenceId) => {
      pw.logout();
      pw.login({ accountType: "ags", accountIndex: 4, notFirstLogin: true });
      agsFilingGrid.init();
      agsFilingGrid.updateStatus("Funded", "Reference ID", String(referenceId));
      pw.logout();
      pw.login({ accountType: "municipal", accountIndex: 4, notFirstLogin: true });
      govApprovalGrid.init();
      govApprovalGrid.selectRowToReject("Reference ID", String(referenceId));
      govApprovalGrid.init();
      govApprovalGrid.getElementOfColumn(
        "Message",
        "Reference ID",
        String(referenceId),
        "message"
      );
      pw.get("@message").then((message) => {
        pw.wrap(message).click();
        govApprovalGrid.getElement().anyModal().should("be.visible");
        govApprovalGrid
          .getElement()
          .anyModal()
          .should("contain.text", "Rejected");
      });
    });
  });
});
