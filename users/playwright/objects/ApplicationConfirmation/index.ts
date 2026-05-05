import { buttonByText, currentPage, labelValue } from "../../support/runtime";

class ApplicationConfirmation {
  private elements() {
    return {
      pageTitle: () => currentPage().locator("h1"),
      printPageButton: () =>
        currentPage().locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Print this page" }).first(),
      closeButton: () => buttonByText("Close"),
      referenceIdData: () => labelValue("Reference ID"),
      paymentDateData: () => labelValue("Payment Date"),
      totalAmountData: () => labelValue("Total Amount"),
      localGovernmentData: () => labelValue("Local Government"),
      formTitleData: () => labelValue("Form Title"),
      applicationStatusData: () => labelValue("Application Status"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickCloseButton() {
    await this.getElement().closeButton().click();
  }

  async clickPrintPageButton() {
    await this.getElement().printPageButton().click();
  }
}

export default ApplicationConfirmation;
