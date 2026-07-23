import { expect, type Page, type Response } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";

const methodIs = (response: Response, method: string) => response.request().method().toUpperCase() === method;

class Payment {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      savedPaymentMethods: () => this.page.locator('label[for="savedPayment"]'),
      savedPaymentMethodItems: () => this.page.locator(".form-section").first().locator(".radio .form-check input, .radio .form-check"),
      termsAndConditionsCheckbox: () => this.page.locator('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'),
      finishAndPayButton: () => this.page.locator("button").filter({ hasText: "Finish and Pay" }).first(),
      payNowButton: () => this.page.locator("button").filter({ hasText: "Pay Now" }).first(),
      payLaterButton: () => this.page.locator("button").filter({ hasText: "Pay Later" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickPayNowButton() {
    await this.getElements().payNowButton().click({ force: true });
  }

  async clickPayLaterButton() {
    await this.getElements().payLaterButton().click({ force: true });
  }

  async clickSavedPaymentMethods() {
    await this.getElements().savedPaymentMethods().click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async selectSavedPaymentMethod(order: number) {
    const responsePromise = this.page
      .waitForResponse((response) => methodIs(response, "PATCH") && response.url().includes("/reeval-for-payment"), { timeout: 15000 })
      .catch(() => null);
    await this.getElements().savedPaymentMethodItems().nth(order).click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201]).toContain(response.status());
  }

  async clickTermsAndConditionsCheckbox() {
    await this.getElements().termsAndConditionsCheckbox().click({ force: true });
  }

  async clickFinishAndPayButton() {
    const checkoutPromise = this.page
      .waitForResponse((response) => methodIs(response, "POST") && response.url().includes("/payments/checkout"), { timeout: 15000 })
      .catch(() => null);
    await this.getElements().finishAndPayButton().click({ force: true });
    const response = await checkoutPromise;
    if (response) expect([200, 201]).toContain(response.status());
  }

  async payViaAnySavedPaymentMethod(paymentMethod = 0) {
    await this.clickSavedPaymentMethods();
    await this.selectSavedPaymentMethod(paymentMethod);
    await this.clickTermsAndConditionsCheckbox();
    await this.clickFinishAndPayButton();
  }
}

export default Payment;
