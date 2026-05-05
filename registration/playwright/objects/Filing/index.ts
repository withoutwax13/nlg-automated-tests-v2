/**
 * Class representing the Filing process.
 */
class Filing {
  constructor() {}

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
      renewButton: () => pw.get(".k-actions").find("button").contains("Renew"),
      submitNewRegistrationButton: () =>
        pw.get(".k-actions").find("button").contains("Submit New Registration"),
      renewChipListSelection: () => pw.get(".k-input-values").find("input"),
      renewAddBusinessButton: () =>
        pw.get(".NLG-Hyperlink").contains("Add a Business"),
      renewNextButton: () => pw.get(".NLGPrimaryButton").contains("Next"),
      renewCancelButton: () => pw.get(".NLGSecondaryButton").contains("Cancel"),
      anyList: () => pw.get("li"),
      createNewApplicationButton: () =>
        pw.get(".NLGButtonSecondary").contains("Create a New Application"),
      cannotFindBusinessButton: () =>
        pw.get(".NLGButtonSecondary").contains("I can't find my business"),
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
    pw.intercept("GET", "https://**.azavargovapps.com/businesses/taxpayerBusinesses?munId=**").as("getMunicipalityBusinesses");
    this.getElements().submitFormsTab().click( {force: true} );
    pw.waitForLoading();
  }

  /**
   * Handles accounts with draft applications.
   */
  private createNewApplication() {
    pw.get(".k-dialog-titlebar").then(($modal) => {
      if ($modal.text().includes("Resume Draft Application")) {
        this.getElements().createNewApplicationButton().click( {force: true} );
      }
    });
  }

  /**
   * Select a government from the list.
   * @param {string} government - The name of the government to select.
   */
  selectGovernment(government: string) {
    this.getElements().governmentSelection().click( {force: true} );
    this.getElements().governmentSelection().type(government);
    this.getElements().anyList().contains(government).click( {force: true} );
    pw.wait("@getMunicipalityBusinesses").its("response.statusCode").should("eq", 200);
  }

  /**
   * Select a form from the list.
   * @param {string} formName - The name of the form to select.
   */
  selectForm(formName: string) {
    this.getElements().formLinkItem(formName).click( {force: true} );
    pw.waitForLoading(10);
  }

  /**
   * Click the renew button.
   */
  clickRenewButton() {
    this.createNewApplication();
    this.getElements().renewButton().click( {force: true} );
  }

  /**
   * Click the submit new registration button.
   */
  clickSubmitNewRegistrationButton(isOneTime?: boolean) {
    this.createNewApplication();
    if (!isOneTime) {
      this.getElements().submitNewRegistrationButton().click( {force: true} );
      this.getElements().cannotFindBusinessButton().click( {force: true} );
      pw.waitForLoading(30);
    } else {
      this.getElements().cannotFindBusinessButton().click( {force: true} );
      pw.waitForLoading(30);
    }
  }

  /**
   * Click the add business button in the renew process.
   */
  clickRenewAddBusinessButton() {
    this.getElements().renewAddBusinessButton().click( {force: true} );
  }

  /**
   * Select a business to renew.
   * @param {string} businessDba - The name of the business to renew.
   */
  selectBusinessToRenew(businessDba: string) {
    this.getElements().renewChipListSelection().click( {force: true} );
    this.getElements().renewChipListSelection().type(businessDba);
    this.getElements().anyList().contains(businessDba).click( {force: true} );
  }

  /**
   * Click the next button in the renew process.
   */
  clickRenewNextButton() {
    this.getElements().renewNextButton().click( {force: true} );
  }

  /**
   * Click the cancel button in the renew process.
   */
  clickRenewCancelButton() {
    this.getElements().renewCancelButton().click( {force: true} );
  }
}

export default Filing;
