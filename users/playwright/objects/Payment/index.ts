class Payment {
  private elements() {
    return {
      savedPaymentMethods: () => cy.get('label[for="savedPayment"]'),
      savedPaymentMethodItems: () =>
        cy.get(".form-section").eq(0).find(".radio").find(".form-check"),
      newPaymentMethod: () => cy.get('label[for="newPaymentRadio"]'),
      saveThisPaymentMethodForFutureUseCheckbox: () =>
        cy.get(
          "input[data-cy='Save this payment method for future use-checkbox']"
        ),
      termsAndConditionsCheckbox: () =>
        cy.get(
          'input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'
        ),
      finishAndPayButton: () => cy.get("button").contains("Finish and Pay"),
      payNowButton: () => cy.get("button").contains("Pay Now"),
      payLaterButton: () => cy.get("button").contains("Pay Later"),
    };
  }

  getElements() {
    return this.elements();
  }

  clickPayNowButton() {
    this.getElements().payNowButton().click();
  }

  clickPayLaterButton() {
    this.getElements().payLaterButton().click();
  }

  clickSavedPaymentMethods() {
    this.getElements().savedPaymentMethods().click();
  }

  clickNewPaymentMethod() {
    // this intercept is important to determine that the iframe is loaded
    // before proceeding to interact with the iframe after
    // the new payment method button is clicked
    cy.intercept("POST", "https://**.amazonaws.com//burton/payment-method").as(
      "burtonPaymentMethod"
    );
    cy.intercept(
      "GET",
      "https://**.i3verticals.com/v2/plugins/payment/payment**"
    ).as("paymentMethodPlugin");
    cy.intercept(
      "POST",
      "https://**.i3verticals.com/v2/plugins/payment/**/token"
    ).as("continuePaymentIframe");
    this.getElements().newPaymentMethod().click();
  }

  clickSaveThisPaymentMethodForFutureUseCheckbox() {
    this.getElements().saveThisPaymentMethodForFutureUseCheckbox().click();
  }

  selectSavedPaymentMethod(order: number) {
    this.getElements().savedPaymentMethodItems().eq(order).click();
    cy.waitForLoading();
  }

  clickTermsAndConditionsCheckbox() {
    this.getElements().termsAndConditionsCheckbox().click();
    cy.waitForLoading();
  }

  clickFinishAndPayButton() {
    this.getElements().finishAndPayButton().click();
  }

  payViaAnySavedPaymentMethod() {
    this.clickSavedPaymentMethods();
    this.selectSavedPaymentMethod(0);
    this.clickTermsAndConditionsCheckbox();
    this.clickFinishAndPayButton();
  }

  addBankAccountDetails(data: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    bankRoutingNumber: string;
    bankAccountNumber: string;
  }) {
    const {
      firstName,
      lastName,
      address1,
      city,
      state,
      postalCode,
      bankRoutingNumber,
      bankAccountNumber,
    } = data;
    cy.wait("@burtonPaymentMethod")
      .its("response.statusCode")
      .should("eq", 201);
    cy.waitForLoading();
    cy.wait("@paymentMethodPlugin")
      .its("response.statusCode")
      .should("eq", 200);
    cy.waitForLoading();
    cy.enter(
      "iframe[src*='https://content-dev.i3verticals.com/uapi/plugins']"
    ).then((getBody) => {
      getBody().find("div[name='tab_bank_account']").click();
      getBody().find("input[name='first_name']").type(firstName);
      getBody().find("input[name='last_name']").type(lastName);
      getBody().find("input[name='address1']").type(address1);
      getBody().find("input[name='city']").type(city);
      getBody().find("select[name='state']").select(state);
      getBody().find("input[name='postal_code']").type(postalCode);
      getBody()
        .find("input[name='bank_routing_number']")
        .type(bankRoutingNumber);
      getBody()
        .find("input[name='bank_account_number']")
        .type(bankAccountNumber);
      getBody()
        .find("input[name='bank_confirm_account_number']")
        .type(bankAccountNumber);
      getBody().find("button").contains("Continue").click();
    });
    cy.wait("@continuePaymentIframe");
  }

  addDebitCreditCardDetails(data: {
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
    const {
      firstName,
      lastName,
      address1,
      city,
      state,
      postalCode,
      cardNumber,
      expirationDate,
      cvv,
    } = data;
    cy.wait("@burtonPaymentMethod")
      .its("response.statusCode")
      .should("eq", 201);
    cy.waitForLoading();
    cy.wait("@paymentMethodPlugin")
      .its("response.statusCode")
      .should("eq", 200);
    cy.waitForLoading();

    cy.enter(
      "iframe[src*='https://content-dev.i3verticals.com/uapi/plugins']"
    ).then((getBody) => {
      getBody().find("input[name='first_name']").type(firstName);
      getBody().find("input[name='last_name']").type(lastName);
      getBody().find("input[name='address1']").type(address1);
      getBody().find("input[name='city']").type(city);
      getBody().find("select[name='state']").select(state);
      getBody().find("input[name='postal_code']").type(postalCode);
      getBody().find("input[name='cc_number']").type(cardNumber);
      getBody().find("input[name='cc_expiration']").type(expirationDate);
      getBody().find("input[name='cc_cvv']").type(cvv);
      getBody().find("button").contains("Continue").click();
    });
    cy.wait("@continuePaymentIframe");
  }
}

export default Payment;
