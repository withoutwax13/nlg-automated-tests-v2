class BusinessConfiguration {
    private elements() {
        return {
            pageTitle: () => pw.get("h1"),
            backButton: () => pw.get("button").contains("Back"),
            allowedFieldsConfigExpander: () => pw.get("#GridFieldsConfig"),
            searchFieldsConfigExpander: () => pw.get("#SearchFieldsConfig"),
            allowTaxpayersToFileNotRemmitanceFormsCheckbox: () => pw.get("label").contains("Allow Taxpayers to File Not Remittance Forms"),
            useUniqueFieldWhenUploadBusinessLiostCheckbox: () => pw.get("label").contains("Use unique field when upload businesses list"),
            saveButton: () => pw.get("button").contains("Save"),
            cancelButton: () => pw.get("button").contains("Cancel"),
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