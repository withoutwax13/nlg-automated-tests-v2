import { currentPage, waitForLoading, withText } from "../../support/runtime";

class Payment {
  private elements() {
    const page = currentPage();

    return {
      savedPaymentMethods: () => page.locator('label[for="savedPayment"]'),
      savedPaymentMethodItems: () => page.locator(".form-section").first().locator(".radio .form-check"),
      termsAndConditionsCheckbox: () =>
        page.locator(
          'input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'
        ),
      finishAndPayButton: () => withText(page.locator("button"), "Finish and Pay"),
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
    await waitForLoading();
  }

  async clickTermsAndConditionsCheckbox() {
    await this.getElements().termsAndConditionsCheckbox().check({ force: true });
    await waitForLoading();
  }

  async clickFinishAndPayButton() {
    await this.getElements().finishAndPayButton().click({ force: true });
  }

  async payViaAnySavedPaymentMethod() {
    await this.clickSavedPaymentMethods();
    await this.selectSavedPaymentMethod(0);
    await this.clickTermsAndConditionsCheckbox();
    await this.clickFinishAndPayButton();
  }
}

export default Payment;
