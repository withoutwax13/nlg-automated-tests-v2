import { type Page } from "@playwright/test";
import { normalizeText } from "../../support/native-helpers";

class ApplicationConfirmation {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1"),
      printPageButton: () => this.page.locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Print this page" }).first(),
      closeButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Close" }).first(),
      referenceIdData: () => this.page.locator("label").filter({ hasText: "Reference ID" }).first().locator("xpath=following-sibling::*[1]"),
      paymentDateData: () => this.page.locator("label").filter({ hasText: "Payment Date" }).first().locator("xpath=following-sibling::*[1]"),
      totalAmountData: () => this.page.locator("label").filter({ hasText: "Total Amount" }).first().locator("xpath=following-sibling::*[1]"),
      localGovernmentData: () => this.page.locator("label").filter({ hasText: "Local Government" }).first().locator("xpath=following-sibling::*[1]"),
      formTitleData: () => this.page.locator("label").filter({ hasText: "Form Title" }).first().locator("xpath=following-sibling::*[1]"),
      applicationStatusData: () => this.page.locator("label").filter({ hasText: "Application Status" }).first().locator("xpath=following-sibling::*[1]"),
    };
  }

  getElement() {
    return this.elements();
  }

  async getReferenceId() {
    return normalizeText(await this.getElement().referenceIdData().textContent());
  }

  async clickCloseButton(_hasPayment = true) {
    await this.getElement().closeButton().click({ force: true });
  }

  async clickPrintPageButton() {
    await this.getElement().printPageButton().click({ force: true });
  }
}

export default ApplicationConfirmation;
