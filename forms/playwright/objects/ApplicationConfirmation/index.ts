import { currentPage, nextSibling, withText } from "../../support/runtime";

class ApplicationConfirmation {
  private elements() {
    const page = currentPage();
    return {
      pageTitle: () => page.locator("h1"),
      printPageButton: () =>
        withText(page.locator(".NLG-HyperlinkNoPadding"), "Print this page"),
      closeButton: () => withText(page.locator(".NLGButtonPrimary"), "Close"),
      referenceIdData: () =>
        nextSibling(withText(page.locator("label"), "Reference ID")),
      paymentDateData: () =>
        nextSibling(withText(page.locator("label"), "Payment Date")),
      totalAmountData: () =>
        nextSibling(withText(page.locator("label"), "Total Amount")),
      localGovernmentData: () =>
        nextSibling(withText(page.locator("label"), "Local Government")),
      formTitleData: () =>
        nextSibling(withText(page.locator("label"), "Form Title")),
      applicationStatusData: () =>
        nextSibling(withText(page.locator("label"), "Application Status")),
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
