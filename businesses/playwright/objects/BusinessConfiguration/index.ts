import { buttonByText, currentPage } from "../../helpers/legacy-helpers";

class BusinessConfiguration {
  private page() {
    return currentPage();
  }

  private elements() {
    return {
      pageTitle: () => this.page().locator("h1").first(),
      backButton: () => buttonByText("Back"),
      allowedFieldsConfigExpander: () => this.page().locator("#GridFieldsConfig"),
      searchFieldsConfigExpander: () => this.page().locator("#SearchFieldsConfig"),
      allowTaxpayersToFileNotRemmitanceFormsCheckbox: () =>
        this.page().locator("label").filter({ hasText: "Allow Taxpayers to File Not Remittance Forms" }).first(),
      useUniqueFieldWhenUploadBusinessLiostCheckbox: () =>
        this.page().locator("label").filter({ hasText: "Use unique field when upload businesses list" }).first(),
      saveButton: () => buttonByText("Save"),
      cancelButton: () => buttonByText("Cancel"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickAllowedFieldsConfigExpander() {
    await this.getElement().allowedFieldsConfigExpander().click();
  }

  async clickSearchFieldsConfigExpander() {
    await this.getElement().searchFieldsConfigExpander().click();
  }

  async clickAllowTaxpayersToFileNotRemmitanceFormsCheckbox() {
    await this.getElement().allowTaxpayersToFileNotRemmitanceFormsCheckbox().click();
  }

  async clickUseUniqueFieldWhenUploadBusinessLiostCheckbox() {
    await this.getElement().useUniqueFieldWhenUploadBusinessLiostCheckbox().click();
  }

  async clickSaveButton() {
    await this.getElement().saveButton().click();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickBackButton() {
    await this.getElement().backButton().click();
  }
}

export default BusinessConfiguration;
