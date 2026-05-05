import Form from "../../../objects/Form";
import FormPreview from "../../../objects/FormPreview";
import Payment from "../../../objects/Payment";
import Filing from "../../../objects/Filing";
import FilingGrid from "../../../objects/FilingGrid";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";
import Business from "../../../objects/Business";

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

const deleteBusiness = (businessDba: string) => {
  business.init();
  business.filterColumn("DBA", businessDba, "text", "Contains");
  cy.waitForLoading();
  business.getElement().rows().its("length").as("businessRowsLength");
  business.clickClearAllFiltersButton();
  cy.get("@businessRowsLength").then((businessRowsLength) => {
    cy.log("businessRowsLength: " + businessRowsLength);
    if (Number(businessRowsLength) > 0) {
      business.deleteBusiness(businessDba);
    }
  });
};

describe("As a taxpayer, I should be able to submit a tax form for a non-listed business.", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 9 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Test DBA #4884",
      "text",
      "Contains"
    );
    agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    cy.get("@rowsLength").then((rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Test DBA #4884"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.clickAddBusinessButton();
    business.addBusinessOnAccount("Test DBA #4884");

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
        cy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    cy.logout();

    cy.login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    deleteBusiness("Test DBA #4884");
  });
});
