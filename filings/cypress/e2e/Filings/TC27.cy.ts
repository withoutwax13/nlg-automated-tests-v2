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

describe("As a taxpayer, I should be able to reattempt a declined filing.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 4 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 40337",
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
          ["Location DBA", "Arrakis Spice Company 40337"]
        );
      }
    });
    cy.logout();

    cy.login({ accountType: "taxpayer", notFirstLogin: true });
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
      .referenceIdData()
      .invoke("text")
      .then((referenceId) => {
        cy.wrap(referenceId).as("referenceId");
      });
    applicationConfirmation.clickCloseButton();
    cy.logout();

    cy.get("@referenceId").then((referenceId) => {
      cy.login({ accountType: "ags", accountIndex: 4, notFirstLogin: true });
      agsFilingGrid.init();
      agsFilingGrid.updateStatus(
        "Declined",
        "Reference ID",
        String(referenceId)
      );
      cy.logout();

      cy.login({ accountType: "taxpayer", notFirstLogin: true });
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
      cy.get("@newFilingStatus").then((newFilingStatus) => {
        expect(newFilingStatus).to.equal("Pending");
      });
    });
  });
});
