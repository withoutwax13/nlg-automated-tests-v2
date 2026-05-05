/**
 * Class representing the Filing process.
 */
class Filing {
  isResumingDraftApplication: boolean;
  constructor(props: { isResumingDraftApplication: boolean }) {
    this.isResumingDraftApplication = props.isResumingDraftApplication;
  }

  /**
   * Get the elements used in the filing process.
   * @returns {Object} The elements used in the filing process.
   */
  private elements() {
    return {
      submitFormsTab: () => cy.get('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        cy.get('input[placeholder="Search government and press enter …"]'),
      formList: () => cy.get('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        this.getElements().formList().find("li").contains(formName),
      modalTitle: () => cy.get("k-dialog-title"),
      closeModalButton: () => cy.get(".k-dialog-titlebar-actions"),
      modalContent: () => cy.get(".k-dialog-content"),
      renewCancelButton: () => cy.get("NLGSecondaryButton").contains("Cancel"),
      anyList: () => cy.get("li"),
      createNewFilingButton: () =>
        cy.get(".NLGButtonSecondary").contains("Create a New Filing"),
      resumeDraftFilingButton: () =>
        cy.get(".NLGButtonPrimary").contains("Resume Draft Filing"),
      businessSelectionDropdown: () =>
        cy.get('*[data-cy="business-dialog-choose-business-comboBox"]'),
      nextButton: () => cy.get(".NLGButtonPrimary").contains("Next"),
      cancelButton: () => cy.get(".NLGButtonSecondary").contains("Cancel"),
      addBusinessButton: () => cy.get(".NLGButtonSecondaryFlat").contains("Add a Business"),
    };
  }

  /**
   * Get the elements used in the filing process.
   * @returns {Object} The elements used in the filing process.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Navigate to the submit forms tab.
   */
  goToSubmitFormsTab() {
    this.getElements().submitFormsTab().click();
    cy.waitForLoading();
  }

  /**
   * Handles accounts with draft filings.
   */
  private startFiling() {
    cy.get("body").then(($body) => {
      const modal = $body.find(".k-dialog-titlebar");
      if (modal.length > 0) {
        if (modal.text().includes("Resume Draft Filing")) {
          if (!this.isResumingDraftApplication) {
            this.getElements().createNewFilingButton().click();
          } else {
            this.getElements().resumeDraftFilingButton().click();
          }
        }
      }
    });
  }

  /**
   * Select a government from the list.
   * @param {string} government - The name of the government to select.
   */
  selectGovernment(government: string) {
    this.getElements().governmentSelection().click();
    this.getElements().governmentSelection().type(government);
    this.getElements().anyList().contains(government).click();
  }

  /**
   * Select a form from the list.
   * @param {string} formName - The name of the form to select.
   */
  selectForm(formName: string) {
    this.getElements().formLinkItem(formName).click();
  }

  /**
   * Select a business to file.
   * @param {string} businessDba - The name of the business to file.
   */
  selectBusinessToFile(businessDba: string) {
    this.getElements().businessSelectionDropdown().click();
    this.getElements().businessSelectionDropdown().type(businessDba);
    this.getElements().anyList().contains(businessDba).click();
    this.clickNextButton();
    this.startFiling();
  }

  clickNextButton() {
    this.getElements().nextButton().click();
    cy.waitForLoading();
  }

  clickCancelButton() {
    this.getElements().cancelButton().click();
  }

  clickAddBusinessButton() {
    this.getElements().addBusinessButton().click();
  }
}

export default Filing;
