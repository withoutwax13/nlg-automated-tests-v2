import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";

class ApplicationConfirmation {
  private elements(page: Page = resolvePage()) {
    return {
      pageTitle: () => page.locator("h1"),
      printPageButton: () => page.getByText("Print this page"),
      closeButton: () => page.getByRole("button", { name: "Close" }),
      referenceIdData: () => page.locator("label").filter({ hasText: "Reference ID" }).locator("xpath=following-sibling::*[1]"),
      paymentDateData: () => page.locator("label").filter({ hasText: "Payment Date" }).locator("xpath=following-sibling::*[1]"),
      totalAmountData: () => page.locator("label").filter({ hasText: "Total Amount" }).locator("xpath=following-sibling::*[1]"),
      localGovernmentData: () => page.locator("label").filter({ hasText: "Local Government" }).locator("xpath=following-sibling::*[1]"),
      formTitleData: () => page.locator("label").filter({ hasText: "Form Title" }).locator("xpath=following-sibling::*[1]"),
      applicationStatusData: () => page.locator("label").filter({ hasText: "Application Status" }).locator("xpath=following-sibling::*[1]"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async clickCloseButton(page: Page = resolvePage()) {
    await this.getElement(page).closeButton().click();
  }

  async clickPrintPageButton(page: Page = resolvePage()) {
    await this.getElement(page).printPageButton().click();
  }
}

export default ApplicationConfirmation;
