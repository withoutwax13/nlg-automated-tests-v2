class Payment {
    private elements () {
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
        this.getElements().savedPaymentMethods().click();
    }

    selectSavedPaymentMethod(order: number) {
        this.getElements().savedPaymentMethodItems().eq(order).click();
        pw.waitForLoading();
    }

    clickTermsAndConditionsCheckbox() {
        this.getElements().termsAndConditionsCheckbox().click();
        pw.waitForLoading();
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
}

export default Payment;