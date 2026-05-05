import { expect, type Response } from "@playwright/test";
import { currentPage, setStoredValue, getStoredValue, waitForLoading } from "../../support/runtime";

type PaymentFrameData = {
  burtonPaymentMethod: Promise<Response>;
  paymentMethodPlugin: Promise<Response>;
  continuePaymentIframe: Promise<Response>;
};

class Payment {
  private elements() {
    return {
      savedPaymentMethods: () => currentPage().locator('label[for="savedPayment"]').first(),
      savedPaymentMethodItems: () => currentPage().locator(".form-section").nth(0).locator(".radio .form-check"),
      newPaymentMethod: () => currentPage().locator('label[for="newPaymentRadio"]').first(),
      saveThisPaymentMethodForFutureUseCheckbox: () =>
        currentPage().locator("input[data-cy='Save this payment method for future use-checkbox']").first(),
      termsAndConditionsCheckbox: () =>
        currentPage().locator('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]').first(),
      finishAndPayButton: () => currentPage().locator("button").filter({ hasText: "Finish and Pay" }).first(),
      payNowButton: () => currentPage().locator("button").filter({ hasText: "Pay Now" }).first(),
      payLaterButton: () => currentPage().locator("button").filter({ hasText: "Pay Later" }).first(),
    };
  }

  private paymentFrame() {
    return currentPage().frameLocator("iframe[src*='https://content-dev.i3verticals.com/uapi/plugins']");
  }

  private async waitForPaymentResponses() {
    const responses = getStoredValue<PaymentFrameData>("paymentFrameData");
    const burton = await responses.burtonPaymentMethod;
    expect(burton.status()).toBe(201);
    await waitForLoading();

    const plugin = await responses.paymentMethodPlugin;
    expect(plugin.status()).toBe(200);
    await waitForLoading();

    return responses;
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

  async clickNewPaymentMethod() {
    setStoredValue("paymentFrameData", {
      burtonPaymentMethod: currentPage().waitForResponse((response) =>
        response.request().method() === "POST" &&
        response.url().includes("amazonaws.com//burton/payment-method")
      ),
      paymentMethodPlugin: currentPage().waitForResponse((response) =>
        response.request().method() === "GET" &&
        response.url().includes("i3verticals.com/v2/plugins/payment/payment")
      ),
      continuePaymentIframe: currentPage().waitForResponse((response) =>
        response.request().method() === "POST" &&
        /i3verticals\.com\/v2\/plugins\/payment\/.+\/token/.test(response.url())
      ),
    } satisfies PaymentFrameData);

    await this.getElements().newPaymentMethod().click();
  }

  async clickSaveThisPaymentMethodForFutureUseCheckbox() {
    await this.getElements().saveThisPaymentMethodForFutureUseCheckbox().click();
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

  async addBankAccountDetails(data: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    bankRoutingNumber: string;
    bankAccountNumber: string;
  }) {
    await this.waitForPaymentResponses();
    const frame = this.paymentFrame();

    await frame.locator("div[name='tab_bank_account']").click();
    await frame.locator("input[name='first_name']").fill(data.firstName);
    await frame.locator("input[name='last_name']").fill(data.lastName);
    await frame.locator("input[name='address1']").fill(data.address1);
    await frame.locator("input[name='city']").fill(data.city);
    await frame.locator("select[name='state']").selectOption({ label: data.state }).catch(async () => {
      await frame.locator("select[name='state']").selectOption(data.state);
    });
    await frame.locator("input[name='postal_code']").fill(data.postalCode);
    await frame.locator("input[name='bank_routing_number']").fill(data.bankRoutingNumber);
    await frame.locator("input[name='bank_account_number']").fill(data.bankAccountNumber);
    await frame.locator("input[name='bank_confirm_account_number']").fill(data.bankAccountNumber);
    await frame.locator("button").filter({ hasText: "Continue" }).first().click();

    const responses = getStoredValue<PaymentFrameData>("paymentFrameData");
    await responses.continuePaymentIframe;
  }

  async addDebitCreditCardDetails(data: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  }) {
    await this.waitForPaymentResponses();
    const frame = this.paymentFrame();

    await frame.locator("input[name='first_name']").fill(data.firstName);
    await frame.locator("input[name='last_name']").fill(data.lastName);
    await frame.locator("input[name='address1']").fill(data.address1);
    await frame.locator("input[name='city']").fill(data.city);
    await frame.locator("select[name='state']").selectOption({ label: data.state }).catch(async () => {
      await frame.locator("select[name='state']").selectOption(data.state);
    });
    await frame.locator("input[name='postal_code']").fill(data.postalCode);
    await frame.locator("input[name='cc_number']").fill(data.cardNumber);
    await frame.locator("input[name='cc_expiration']").fill(data.expirationDate);
    await frame.locator("input[name='cc_cvv']").fill(data.cvv);
    await frame.locator("button").filter({ hasText: "Continue" }).first().click();

    const responses = getStoredValue<PaymentFrameData>("paymentFrameData");
    await responses.continuePaymentIframe;
  }
}

export default Payment;
