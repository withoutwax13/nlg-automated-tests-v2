import { expect, type Page } from "@playwright/test";

class ExportFiling {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      csvFileTypeRadio: () => this.page.locator('input[value="CSV"], label').filter({ hasText: "CSV" }).first(),
      excelFileTypeRadio: () => this.page.locator('input[value="Excel"], label').filter({ hasText: "Excel" }).first(),
      exportFullDataButton: () => this.page.locator(".k-dialog button, .NLGButtonPrimary").filter({ hasText: "Export Full Data" }).first(),
      exportViewButton: () => this.page.locator(".k-dialog button, .NLGButtonPrimary").filter({ hasText: "Export View" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async selectCSVFileType() {
    await this.getElements().csvFileTypeRadio().click({ force: true });
  }

  async selectExcelFileType() {
    await this.getElements().excelFileTypeRadio().click({ force: true });
  }

  async clickExportFullDataButton() {
    await expect(this.getElements().exportFullDataButton()).toBeEnabled();
    await this.getElements().exportFullDataButton().click({ force: true });
  }

  async clickExportViewButton() {
    await expect(this.getElements().exportViewButton()).toBeEnabled();
    await this.getElements().exportViewButton().click({ force: true });
  }
}

export default ExportFiling;
