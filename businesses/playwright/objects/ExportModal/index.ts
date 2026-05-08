import type { Page } from "@playwright/test";

class ExportModal {
  private page!: Page;
  async init(page: Page) { this.page = page; }
  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").first(),
      modalTitle: () => this.page.locator(".k-dialog-title").first(),
      closeButton: () => this.page.locator('button[aria-label="Close"]').first(),
      csvOption: () => this.page.locator(".k-radio-item").nth(0),
      excelOption: () => this.page.locator(".k-radio-item").nth(1),
      exportFullOption: () => this.page.locator(".k-radio-item").nth(2),
      exportViewOption: () => this.page.locator(".k-radio-item").nth(3),
      exportWithUsersInfoYesOption: () => this.page.locator(".k-radio-item").nth(4),
      exportWithUsersInfoNoOption: () => this.page.locator(".k-radio-item").nth(5),
      exportButton: () => this.page.locator(".k-dialog .NLGButtonSecondary").filter({ hasText: "Export" }).first(),
    };
  }
  getElement() { return this.elements(); }
  async clickCloseButton() { await this.getElement().closeButton().click(); }
  async clickCsvOption() { await this.getElement().csvOption().click(); }
  async clickExcelOption() { await this.getElement().excelOption().click(); }
  async clickExportWithUsersInfoOption() { await this.getElement().exportWithUsersInfoYesOption().click(); }
  async clickExportWithoutUsersInfoOption() { await this.getElement().exportWithUsersInfoNoOption().click(); }
  async clickExportViewOption() { await this.getElement().exportViewOption().click(); }
  async clickExportFullOption() { await this.getElement().exportFullOption().click(); }
  async clickExportButton() { await this.getElement().exportButton().click(); }
}

export default ExportModal;
