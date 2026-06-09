import { expect, type Page, type Response } from "@playwright/test";
import Form from "../Form";

class FormPreview extends Form {
  constructor(page: Page) {
    super(page, { isRenewal: false });
  }

  private formPreviewElements() {
    return {
      ...super.getElement(),
      submitButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: /Go to Payment|Submit/ }).first(),
      accordion: () => this.page.locator(".k-expander").first().locator("xpath=.."),
      accordionSteps: () => this.page.locator(".k-expander"),
      paymentDetails: () => this.page.locator("h2").filter({ hasText: "Payment Details" }).first().locator("xpath=following-sibling::*[1]"),
      duplicateRegistrationWarning: () => this.page.locator("*").filter({ hasText: "Duplicate Registration Detected" }).first(),
    };
  }

  getElement() {
    return this.formPreviewElements();
  }

  private waitForOptionalResponse(predicate: (response: Response) => boolean, timeout = 10000) {
    return this.page.waitForResponse(predicate, { timeout }).catch(() => null);
  }

  async clickSubmitButton() {
    const submitPromise = this.waitForOptionalResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes("/filings/") &&
        response.url().includes("/submit")
    );
    await expect(this.getElement().submitButton()).toBeEnabled();
    await this.getElement().submitButton().click({ force: true });
    const response = await submitPromise;
    if (response) expect([200, 201]).toContain(response.status());
  }

  async toggleStepAccordion(stepName: string, toExpand: boolean) {
    const stepIndex = ["Instructions", "Basic Info", "Location Info", "Applicant Info"].indexOf(stepName);
    const step = this.getElement().accordionSteps().nth(stepIndex);
    const expanded = await step.locator("div").first().getAttribute("aria-expanded");
    if ((toExpand && expanded === "false") || (!toExpand && expanded === "true")) {
      await step.click({ force: true });
    }
  }
}

export default FormPreview;
