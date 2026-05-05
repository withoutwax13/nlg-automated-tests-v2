class BusinessConfiguration {
    private elements() {
        return {
            pageTitle: () => cy.get("h1"),
            backButton: () => cy.get("button").contains("Back"),
            allowedFieldsConfigExpander: () => cy.get("#GridFieldsConfig"),
            searchFieldsConfigExpander: () => cy.get("#SearchFieldsConfig"),
            allowTaxpayersToFileNotRemmitanceFormsCheckbox: () => cy.get("label").contains("Allow Taxpayers to File Not Remittance Forms"),
            useUniqueFieldWhenUploadBusinessLiostCheckbox: () => cy.get("label").contains("Use unique field when upload businesses list"),
            saveButton: () => cy.get("button").contains("Save"),
            cancelButton: () => cy.get("button").contains("Cancel"),
        }
    }

    getElement() {
        return this.elements();
    }
    clickAllowedFieldsConfigExpander() {
        this.getElement().allowedFieldsConfigExpander().click();
    }

    clickSearchFieldsConfigExpander() {
        this.getElement().searchFieldsConfigExpander().click();
    }

    clickAllowTaxpayersToFileNotRemmitanceFormsCheckbox() {
        this.getElement().allowTaxpayersToFileNotRemmitanceFormsCheckbox().click();
    }

    clickUseUniqueFieldWhenUploadBusinessLiostCheckbox() {
        this.getElement().useUniqueFieldWhenUploadBusinessLiostCheckbox().click();
    }

    clickSaveButton() {
        this.getElement().saveButton().click();
    }

    clickCancelButton() {
        this.getElement().cancelButton().click();
    }

    clickBackButton() {
        this.getElement().backButton().click();
    }
}

export default BusinessConfiguration;