class Payment {
    private elements () {
        return {
            savedPaymentMethods: () => pw.get('label[for="savedPayment"]'),
            savedPaymentMethodItems: () => pw.get('.form-section').eq(0).find('.radio').find('.form-check'),
            termsAndConditionsCheckbox: () => pw.get('input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'),
            finishAndPayButton: () => pw.get('button').contains('Finish and Pay')
        }
    }

    getElements() {
        return this.elements();
    }

    clickSavedPaymentMethods() {
        this.getElements().savedPaymentMethods().click( {force: true} );
    }

    selectSavedPaymentMethod(order: number) {
        this.getElements().savedPaymentMethodItems().eq(order).click( {force: true} );
        pw.waitForLoading();
    }

    clickTermsAndConditionsCheckbox() {
        this.getElements().termsAndConditionsCheckbox().click( {force: true} );
        pw.waitForLoading();
    }

    clickFinishAndPayButton() {
        this.getElements().finishAndPayButton().click( {force: true} );
    }

    payViaAnySavedPaymentMethod() {
        this.clickSavedPaymentMethods();
        this.selectSavedPaymentMethod(0);
        this.clickTermsAndConditionsCheckbox();
        this.clickFinishAndPayButton();
    }
}

export default Payment;