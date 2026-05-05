class Payment {
    private elements() {
        return {
            savedPaymentMethods: () => pw.get('label[for="savedPayment"]'),
            savedPaymentMethodItems: () => pw.get('.form-section').eq(0).find('.radio').find('.form-check'),
            termsAndConditionsCheckbox: () => pw.get('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'),
            finishAndPayButton: () => pw.get('button').contains('Finish and Pay'),
            payNowButton: () => pw.get('button').contains('Pay Now'),
            payLaterButton: () => pw.get('button').contains('Pay Later'),
        }
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
        pw.intercept("GET", "https://**.azavargovapps.com/forms/payment-options/**").as("getPaymentOptions");
        pw.intercept("POST", "https://**.azavargovapps.com/payments/burton/payment-method").as("addBurtonPaymentMethod");
        pw.intercept("GET", "https://**.azavargovapps.com/payments/paymentMethods").as("getPaymentMethods");
        this.getElements().savedPaymentMethods().click();
        pw.wait("@getPaymentOptions").its("response.statusCode").should("eq", 200);
        pw.wait("@getPaymentMethods").its("response.statusCode").should("eq", 200);
        pw.wait("@addBurtonPaymentMethod").its("response.statusCode").should("eq", 201);
    }

    selectSavedPaymentMethod(order: number) {
        pw.intercept("PATCH", "https://**.azavargovapps.com/filings/**/reeval-for-payment").as("reevalForPayment");
        this.getElements().savedPaymentMethodItems().eq(order).click();
        pw.wait("@reevalForPayment").its("response.statusCode").should("be.oneOf", [200, 201]);
    }

    clickTermsAndConditionsCheckbox() {
        this.getElements().termsAndConditionsCheckbox().click();
    }

    clickFinishAndPayButton() {
        pw.intercept("POST", "https://**.azavargovapps.com/payments/checkout").as("checkout");
        pw.intercept("GET", "https://**.azavargovapps.com/filings/**").as("getFiling");
        pw.intercept("GET", "https://**.azavargovapps.com/payments/payment/**").as("getPayment");
        this.getElements().finishAndPayButton().click();
    }

    payViaAnySavedPaymentMethod() {
        this.clickSavedPaymentMethods();
        this.selectSavedPaymentMethod(0);
        this.clickTermsAndConditionsCheckbox();
        this.clickFinishAndPayButton();
    }
}

export default Payment;