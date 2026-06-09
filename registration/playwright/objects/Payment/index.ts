import { expect, type Page, type Response } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";

const isAzavar = (response: Response) => response.url().includes("azavargovapps.com");
const methodIs = (response: Response, method: string) => response.request().method().toUpperCase() === method;

class Payment {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      savedPaymentMethods: () => this.page.locator('label[for="savedPayment"]'),
      savedPaymentMethodItems: () => this.page.locator(".form-section").first().locator(".radio .form-check"),
      termsAndConditionsCheckbox: () => this.page.locator('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'),
      finishAndPayButton: () => this.page.locator("button").filter({ hasText: "Finish and Pay" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickSavedPaymentMethods() {
    await this.getElements().savedPaymentMethods().click({ force: true });
  }

  async selectSavedPaymentMethod(order: number) {
    await this.getElements().savedPaymentMethodItems().nth(order).click({ force: true });
    await waitForLoading(this.page);
  }

  async clickTermsAndConditionsCheckbox() {
    await this.getElements().termsAndConditionsCheckbox().click({ force: true });
    await waitForLoading(this.page);
  }

  async clickFinishAndPayButton() {
    const checkoutPromise = this.page.waitForResponse(
      (response) => methodIs(response, "POST") && isAzavar(response) && response.url().includes("/payments/checkout"),
      { timeout: 15000 }
    ).catch(() => null);
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
