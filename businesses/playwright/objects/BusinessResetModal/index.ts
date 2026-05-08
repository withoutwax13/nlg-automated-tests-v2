import type { Page } from "@playwright/test";

class BusinessResetModal {
  private page!: Page;
  async init(page: Page) { this.page = page; }
  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").first(),
      modalTitle: () => this.page.locator(".k-dialog-title").first(),
      modalContent: () => this.page.locator(".k-dialog-content").first(),
      cancelButton: () => this.page.getByRole("button", { name: "Cancel" }),
      deleteDataButton: () => this.page.getByRole("button", { name: "Delete Data" }),
      sureWantToDeleteDataCheckbox: () => this.page.locator(".k-checkbox-label").first(),
      closeModalButton: () => this.page.locator('button[aria-label="Close"]').first(),
    };
  }
  getElement() { return this.elements(); }
  async clickCancelButton() { await this.getElement().cancelButton().click(); }
  async clickDeleteDataButton() { await this.getElement().deleteDataButton().click(); }
  async clickSureWantToDeleteDataCheckbox() { await this.getElement().sureWantToDeleteDataCheckbox().click(); }
  async clickCloseModalButton() { await this.getElement().closeModalButton().click(); }
}

export default BusinessResetModal;
