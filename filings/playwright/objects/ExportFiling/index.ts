import { expect, type Page } from "@playwright/test";

class ExportFiling {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").last(),
      closeButton: () => this.page.locator(".k-dialog button").filter({ hasText: /Close|Cancel/ }).last(),
      fileTypeRadioButton: (type: "CSV" | "Excel") => this.page.locator(".k-dialog label, .k-dialog input").filter({ hasText: type }).first(),
      exportFullDataButton: () => this.page.locator(".k-dialog button").filter({ hasText: "Export Full Data" }).first(),
      exportViewButton: () => this.page.locator(".k-dialog button").filter({ hasText: "Export View" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async selectCSVFileType() {
    await this.getElement().fileTypeRadioButton("CSV").click({ force: true });
  }

  async selectExcelFileType() {
    await this.getElement().fileTypeRadioButton("Excel").click({ force: true });
  }

  async clickExportFullDataButton() {
    await expect(this.getElement().exportFullDataButton()).toBeEnabled();
    await this.getElement().exportFullDataButton().click({ force: true });
  }

  async clickExportViewButton() {
    await expect(this.getElement().exportViewButton()).toBeEnabled();
    await this.getElement().exportViewButton().click({ force: true });
  }

  async clickCloseButton() {
    await this.getElement().closeButton().click({ force: true });
  }
}

export default ExportFiling;
