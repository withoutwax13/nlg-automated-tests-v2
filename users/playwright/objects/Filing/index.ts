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
      submitFormsTab: () => pw.get('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        pw.get('input[placeholder="Search government and press enter …"]'),
      formList: () => pw.get('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        this.getElements().formList().find("li").contains(formName),
      modalTitle: () => pw.get("k-dialog-title"),
      closeModalButton: () => pw.get(".k-dialog-titlebar-actions"),
      modalContent: () => pw.get(".k-dialog-content"),
      renewCancelButton: () => pw.get("NLGSecondaryButton").contains("Cancel"),
      anyList: () => pw.get("li"),
      createNewFilingButton: () =>
        pw.get(".NLGButtonSecondary").contains("Create a New Filing"),
      resumeDraftFilingButton: () =>
        pw.get(".NLGButtonPrimary").contains("Resume Draft Filing"),
      businessSelectionDropdown: () =>
        pw.get('*[data-cy="business-dialog-choose-business-comboBox"]'),
      nextButton: () => pw.get(".NLGButtonPrimary").contains("Next"),
      cancelButton: () => pw.get(".NLGButtonSecondary").contains("Cancel"),
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
    pw.waitForLoading();
  }

  /**
   * Handles accounts with draft filings.
   */
  private startFiling() {
    pw.get("body").then(($body) => {
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
    pw.waitForLoading();
  }

  clickCancelButton() {
    this.getElements().cancelButton().click();
  }
}

export default Filing;
