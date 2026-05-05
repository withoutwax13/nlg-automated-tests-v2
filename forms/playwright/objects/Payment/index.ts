import { currentPage, waitForLoading, withText } from "../../support/runtime";

class Payment {
  private elements() {
    const page = currentPage();
    return {
      savedPaymentMethods: () => page.locator('label[for="savedPayment"]'),
      savedPaymentMethodItems: () =>
        page.locator(".form-section").nth(0).locator(".radio .form-check"),
      termsAndConditionsCheckbox: () =>
        page.locator(
          'input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'
        ),
      finishAndPayButton: () => withText(page.locator("button"), "Finish and Pay"),
      payNowButton: () => withText(page.locator("button"), "Pay Now"),
      payLaterButton: () => withText(page.locator("button"), "Pay Later"),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickPayNowButton() {
    await this.getElements().payNowButton().click();
  }

  async clickPayLaterButton() {
    await this.getElements().payLaterButton().click();
  }

  async clickSavedPaymentMethods() {
    await this.getElements().savedPaymentMethods().click();
  }

  async selectSavedPaymentMethod(order: number) {
    await this.getElements().savedPaymentMethodItems().nth(order).click();
    await waitForLoading();
  }

  async clickTermsAndConditionsCheckbox() {
    await this.getElements().termsAndConditionsCheckbox().click();
    await waitForLoading();
  }

  async clickFinishAndPayButton() {
    await this.getElements().finishAndPayButton().click();
  }

  async payViaAnySavedPaymentMethod() {
    await this.clickSavedPaymentMethods();
    await this.selectSavedPaymentMethod(0);
    await this.clickTermsAndConditionsCheckbox();
    await this.clickFinishAndPayButton();
  }
}

export default Payment;
