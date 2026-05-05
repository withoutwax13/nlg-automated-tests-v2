class Payment {
    private elements () {
        return {
            savedPaymentMethods: () => cy.get('label[for="savedPayment"]'),
            savedPaymentMethodItems: () => cy.get('.form-section').eq(0).find('.radio').find('.form-check'),
            termsAndConditionsCheckbox: () => cy.get('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'),
            finishAndPayButton: () => cy.get('button').contains('Finish and Pay'),
            payNowButton: () => cy.get('button').contains('Pay Now'),
            payLaterButton: () => cy.get('button').contains('Pay Later'),
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
}

export default Payment;