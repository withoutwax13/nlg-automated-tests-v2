import { expect } from "@playwright/test";
import { currentPage, attrOf, nextSibling, withText } from "../../support/runtime";
import Form from "../Form";

class FormPreview extends Form {
  private formPreviewElements() {
    const page = currentPage();
    return {
      ...super.getElement(),
      submitButton: () =>
        withText(page.locator(".NLGButtonPrimary"), /Go to Payment|Submit/),
      accordion: () => page.locator(".k-expander").nth(0).locator("xpath=.."),
      accordionSteps: () => page.locator(".k-expander"),
      paymentDetails: () =>
        nextSibling(withText(page.locator("h2"), "Payment Details")),
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
    const stepIndex = [
      "Instructions",
      "Basic Info",
      "Tax Info",
      "Preparer Info",
    ].indexOf(stepName);

    const accordionStep = this.getElement().accordionSteps().nth(stepIndex);
    const expanded = await attrOf(accordionStep.locator("div").nth(0), "aria-expanded");
    if (toExpand && expanded === "false") {
      await accordionStep.click();
    }
    if (!toExpand && expanded === "true") {
      await accordionStep.click();
    }
  }
}

export default FormPreview;
