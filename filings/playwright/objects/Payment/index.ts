import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";

class Payment {
  private elements(page: Page = resolvePage()) {
    return {
      savedPaymentMethods: () => page.locator('label[for="savedPayment"]'),
      savedPaymentMethodItems: () =>
        page.locator(".form-section").nth(0).locator(".radio .form-check"),
      termsAndConditionsCheckbox: () =>
        page.locator(
          'input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'
        ),
      finishAndPayButton: () => page.getByRole("button", { name: "Finish and Pay" }),
      payNowButton: () => page.getByRole("button", { name: "Pay Now" }),
      payLaterButton: () => page.getByRole("button", { name: "Pay Later" }),
    };
  }

  getElements(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async clickPayNowButton(page: Page = resolvePage()) {
    await this.getElements(page).payNowButton().click();
  }

  async clickPayLaterButton(page: Page = resolvePage()) {
    await this.getElements(page).payLaterButton().click();
  }

  async clickSavedPaymentMethods(page: Page = resolvePage()) {
    await this.getElements(page).savedPaymentMethods().click();
    await page.waitForTimeout(2000);
  }

  async selectSavedPaymentMethod(page: Page = resolvePage(), order: number) {
    await this.getElements(page).savedPaymentMethodItems().nth(order).click();
    await page.waitForTimeout(2000);
  }

  async clickTermsAndConditionsCheckbox(page: Page = resolvePage()) {
    await this.getElements(page).termsAndConditionsCheckbox().click();
  }

  async clickFinishAndPayButton(page: Page = resolvePage()) {
    await this.getElements(page).finishAndPayButton().click();
  }

  async payViaAnySavedPaymentMethod(page: Page = resolvePage()) {
    await this.clickSavedPaymentMethods(page);
    await this.selectSavedPaymentMethod(page, 0);
    await this.clickTermsAndConditionsCheckbox(page);
    await this.clickFinishAndPayButton(page);
  }
}

export default Payment;
