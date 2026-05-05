import { expect } from "@playwright/test";
import { currentPage, withText } from "../../support/runtime";
import Form from "../Form";

class FormPreview extends Form {
  constructor() {
    super({ isRenewal: false });
  }

  private formPreviewElements() {
    const page = currentPage();

    return {
      ...super.getElement(),
      submitButton: () => page.locator(".NLGButtonPrimary").filter({ hasText: /Go to Payment|Submit/ }).first(),
      accordion: () => page.locator(".k-expander").first().locator("xpath=.."),
      accordionSteps: () => page.locator(".k-expander"),
      paymentDetails: () => withText(page.locator("h2"), "Payment Details").locator("xpath=following-sibling::*[1]"),
      duplicateRegistrationWarning: () => page.getByText("Duplicate Registration Detected", { exact: false }).first(),
    };
  }

  getElement() {
    return this.formPreviewElements();
  }

  async clickSubmitButton() {
    await expect(this.getElement().submitButton()).toBeEnabled();
    await this.getElement().submitButton().click({ force: true });
  }

  async toggleStepAccordion(stepName: string, toExpand: boolean) {
    const stepIndex = ["Instructions", "Basic Info", "Location Info", "Applicant Info"].indexOf(stepName);
    const trigger = this.getElement().accordionSteps().nth(stepIndex).locator("div").first();
    const expanded = await trigger.getAttribute("aria-expanded");

    if (toExpand && expanded === "false") {
      await this.getElement().accordionSteps().nth(stepIndex).click({ force: true });
    }

    if (!toExpand && expanded === "true") {
      await this.getElement().accordionSteps().nth(stepIndex).click({ force: true });
    }
  }
}

export default FormPreview;
