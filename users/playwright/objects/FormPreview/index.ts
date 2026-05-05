import { expect } from "@playwright/test";
import { currentPage } from "../../support/runtime";
import Form from "../Form";

class FormPreview extends Form {
  private formPreviewElements() {
    return {
      ...super.getElement(),
      submitButton: () =>
        currentPage().locator(".NLGButtonPrimary").filter({ hasText: /Go to Payment|Submit/ }).first(),
      accordion: () => currentPage().locator(".k-expander").first().locator("xpath=.."),
      accordionSteps: () => this.getElement().accordion().locator(".k-expander"),
      paymentDetails: () =>
        currentPage().locator("h2").filter({ hasText: "Payment Details" }).first().locator("xpath=following-sibling::*[1]"),
    };
  }

  getElement() {
    return this.formPreviewElements();
  }

  async clickSubmitButton() {
    await expect(this.getElement().submitButton()).toBeEnabled();
    await this.getElement().submitButton().click();
  }

  async toggleStepAccordion(stepName: string, toExpand: boolean) {
    const stepIndex = ["Instructions", "Basic Info", "Tax Info", "Preparer Info"].indexOf(stepName);
    const trigger = this.getElement().accordionSteps().nth(stepIndex);
    const expanded = await trigger.locator("div").first().getAttribute("aria-expanded");

    if ((toExpand && expanded === "false") || (!toExpand && expanded === "true")) {
      await trigger.click();
    }
  }
}

export default FormPreview;
