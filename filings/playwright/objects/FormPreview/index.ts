import { expect, Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import Form from "../Form";

class FormPreview extends Form {
  private formPreviewElements(page: Page = resolvePage()) {
    return {
      ...super.getElement(page),
      submitButton: () => page.locator(".NLGButtonPrimary").filter({ hasText: /Go to Payment|Submit/ }).first(),
      accordion: () => page.locator(".k-expander").nth(0).locator("xpath=.."),
      accordionSteps: () => page.locator(".k-expander"),
      paymentDetails: () => page.locator("h2").filter({ hasText: "Payment Details" }).locator("xpath=following-sibling::*[1]"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.formPreviewElements(page);
  }

  async clickSubmitButton(page: Page = resolvePage()) {
    await expect(this.getElement(page).submitButton()).toBeEnabled();
    await this.getElement(page).submitButton().click();
  }

  async toggleStepAccordion(page: Page = resolvePage(), stepName: string, toExpand: boolean) {
    const stepIndex = [
      "Instructions",
      "Basic Info",
      "Tax Info",
      "Preparer Info",
    ].indexOf(stepName);
    const step = this.getElement(page).accordionSteps().nth(stepIndex);
    const expanded = await step.locator("div").nth(0).getAttribute("aria-expanded");
    if ((toExpand && expanded === "false") || (!toExpand && expanded === "true")) {
      await step.click();
    }
  }
}

export default FormPreview;
