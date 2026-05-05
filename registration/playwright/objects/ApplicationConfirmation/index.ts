import { currentPage, labelValue, withText } from "../../support/runtime";

class ApplicationConfirmation {
  private elements() {
    const page = currentPage();

    return {
      pageTitle: () => page.locator("h1").first(),
      printPageButton: () => page.locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Print this page" }).first(),
      closeButton: () => withText(page.locator(".NLGButtonPrimary"), "Close"),
      referenceIdData: () => labelValue("Reference ID"),
      dateOfSubmissionData: () => labelValue("Date of Submission"),
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
    await this.getElement().closeButton().click({ force: true });
  }

  async clickPrintPageButton() {
    await this.getElement().printPageButton().click({ force: true });
  }
}

export default ApplicationConfirmation;
