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
      submitFormsTab: () => cy.get('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        cy.get('input[placeholder="Search government and press enter …"]'),
      formList: () => cy.get('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        this.getElements().formList().find("li").contains(formName),
      modalTitle: () => cy.get("k-dialog-title"),
      closeModalButton: () => cy.get(".k-dialog-titlebar-actions"),
      modalContent: () => cy.get(".k-dialog-content"),
      renewButton: () => cy.get(".k-actions").find("button").contains("Renew"),
      submitNewRegistrationButton: () =>
        cy.get(".k-actions").find("button").contains("Submit New Registration"),
      renewChipListSelection: () => cy.get(".k-input-values").find("input"),
      renewAddBusinessButton: () =>
        cy.get(".NLG-Hyperlink").contains("Add a Business"),
      renewNextButton: () => cy.get(".NLGPrimaryButton").contains("Next"),
      renewCancelButton: () => cy.get(".NLGSecondaryButton").contains("Cancel"),
      anyList: () => cy.get("li"),
      createNewApplicationButton: () =>
        cy.get(".NLGButtonSecondary").contains("Create a New Application"),
      cannotFindBusinessButton: () =>
        cy.get(".NLGButtonSecondary").contains("I can't find my business"),
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
    cy.intercept("GET", "https://**.azavargovapps.com/businesses/taxpayerBusinesses?munId=**").as("getMunicipalityBusinesses");
    this.getElements().submitFormsTab().click( {force: true} );
    cy.waitForLoading();
  }

  /**
   * Handles accounts with draft applications.
   */
  private createNewApplication() {
    cy.get(".k-dialog-titlebar").then(($modal) => {
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
    cy.wait("@getMunicipalityBusinesses").its("response.statusCode").should("eq", 200);
  }

  /**
   * Select a form from the list.
   * @param {string} formName - The name of the form to select.
   */
  selectForm(formName: string) {
    this.getElements().formLinkItem(formName).click( {force: true} );
    cy.waitForLoading(10);
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
      cy.waitForLoading(30);
    } else {
      this.getElements().cannotFindBusinessButton().click( {force: true} );
      cy.waitForLoading(30);
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
