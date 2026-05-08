import type { Page } from "@playwright/test";

class BusinessConfiguration {
  private page!: Page;

  async init(page: Page) { this.page = page; }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1").first(),
      backButton: () => this.page.getByRole("button", { name: "Back" }),
      allowedFieldsConfigExpander: () => this.page.locator("#GridFieldsConfig"),
      searchFieldsConfigExpander: () => this.page.locator("#SearchFieldsConfig"),
      allowTaxpayersToFileNotRemmitanceFormsCheckbox: () => this.page.locator("label").filter({ hasText: "Allow Taxpayers to File Not Remittance Forms" }).first(),
      useUniqueFieldWhenUploadBusinessLiostCheckbox: () => this.page.locator("label").filter({ hasText: "Use unique field when upload businesses list" }).first(),
      saveButton: () => this.page.getByRole("button", { name: "Save" }),
      cancelButton: () => this.page.getByRole("button", { name: "Cancel" }),
    };
  }
  getElement() { return this.elements(); }
  async clickAllowedFieldsConfigExpander() { await this.getElement().allowedFieldsConfigExpander().click(); }
  async clickSearchFieldsConfigExpander() { await this.getElement().searchFieldsConfigExpander().click(); }
  async clickAllowTaxpayersToFileNotRemmitanceFormsCheckbox() { await this.getElement().allowTaxpayersToFileNotRemmitanceFormsCheckbox().click(); }
  async clickUseUniqueFieldWhenUploadBusinessLiostCheckbox() { await this.getElement().useUniqueFieldWhenUploadBusinessLiostCheckbox().click(); }
  async clickSaveButton() { await this.getElement().saveButton().click(); }
  async clickCancelButton() { await this.getElement().cancelButton().click(); }
  async clickBackButton() { await this.getElement().backButton().click(); }
}

export default BusinessConfiguration;
