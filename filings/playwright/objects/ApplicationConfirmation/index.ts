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
      pageTitle: () => pw.get("h1"),
      systemMessage: () => this.getElement().systemMessage().next(),
      printPageButton: () =>
        pw.get(".NLG-HyperlinkNoPadding").contains("Print this page"),
      closeButton: () => pw.get(".NLGButtonPrimary").contains("Close"),
      referenceIdData: () => pw.get("label").contains("Reference ID").next(),
      paymentDateData: () =>
        pw.get("label").contains("Payment Date").next(),
      totalAmountData: () => pw.get("label").contains("Total Amount").next(),
      localGovernmentData: () =>
        pw.get("label").contains("Local Government").next(),
      formTitleData: () => pw.get("label").contains("Form Title").next(),
      applicationStatusData: () =>
        pw.get("label").contains("Application Status").next(),
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
      pw.wait("@checkout").its("response.statusCode").should("eq", 201);
      pw.wait("@getFiling").its("response.statusCode").should("eq", 200);
      pw.wait("@getPayment").its("response.statusCode").should("eq", 200);
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