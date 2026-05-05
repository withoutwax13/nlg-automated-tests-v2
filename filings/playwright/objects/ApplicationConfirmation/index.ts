/**
 * Page Object Model (POM) class representing the Filing Confirmation page.
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
      paymentDateData: () =>
        cy.get("label").contains("Payment Date").next(),
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
  clickCloseButton(hasPayment = true) {
    if (hasPayment) {
      cy.wait("@checkout").its("response.statusCode").should("eq", 201);
      cy.wait("@getFiling").its("response.statusCode").should("eq", 200);
      cy.wait("@getPayment").its("response.statusCode").should("eq", 200);
    }
    this.getElement().closeButton().click();
  }

  /**
   * Clicks the "Print this page" button on the Application Confirmation page.
   * @returns {void}
   */
  clickPrintPageButton() {
    this.getElement().printPageButton().click();
  }
}

export default ApplicationConfirmation;