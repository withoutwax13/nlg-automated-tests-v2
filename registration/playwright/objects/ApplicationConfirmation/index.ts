/**
 * Page Object Model (POM) class representing the Application Confirmation page.
 */
class ApplicationConfirmation {
  /**
   * Retrieves the elements on the Application Confirmation page.
   * @returns {Object} An object containing methods to get various elements on the page.
   */
  private elements() {
    return {
      pageTitle: () => cy.get("h1"),
      systemMessage: () => this.getElement().systemMessage().next(),
      printPageButton: () =>
        cy.get(".NLG-HyperlinkNoPadding").contains("Print this page"),
      closeButton: () => cy.get(".NLGButtonPrimary").contains("Close"),
      referenceIdData: () => cy.get("label").contains("Reference ID").next(),
      dateOfSubmissionData: () =>
        cy.get("label").contains("Date of Submission").next(),
      totalAmountData: () => cy.get("label").contains("Total Amount").next(),
      localGovernmentData: () =>
        cy.get("label").contains("Local Government").next(),
      formTitleData: () => cy.get("label").contains("Form Title").next(),
      applicationStatusData: () =>
        cy.get("label").contains("Application Status").next(),
    };
  }

  /**
   * Retrieves the elements on the Application Confirmation page.
   * @returns {Object} An object containing methods to get various elements on the page.
   */
  getElement() {
    return this.elements();
  }

  /**
   * Clicks the "Close" button on the Application Confirmation page.
   * @returns {void}
   */
  clickCloseButton() {
    this.getElement().closeButton().click( {force: true} );
  }

  /**
   * Clicks the "Print this page" button on the Application Confirmation page.
   * @returns {void}
   */
  clickPrintPageButton() {
    this.getElement().printPageButton().click( {force: true} );
  }
}

export default ApplicationConfirmation;