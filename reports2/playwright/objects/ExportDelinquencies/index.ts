import type { Locator, Page } from "@playwright/test";

class ExportDelinquencies {
  constructor(private readonly page: Page) {}

  private elements() {
    const modal = this.page.locator(".k-dialog");
    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeButton: () => modal.locator('button[aria-label="Close"]'),
      modalContent: () => modal.locator(".k-dialog-content"),
      fileTypeRadioButton: (type: "CSV" | "Excel") =>
        modal.locator(".k-radio-list label").filter({ hasText: type }).first(),
      exportFullDataButton: () =>
        modal.getByRole("button", { name: "Export Full Data" }),
      exportViewButton: () => modal.getByRole("button", { name: "Export View" }),
    };
  }

  getElement() {
    return this.elements();
  }

  clickExportFullDataButton(): Promise<void> {
    return this.getElement().exportFullDataButton().click();
  }

  clickExportViewButton(): Promise<void> {
    return this.getElement().exportViewButton().click();
  }

  clickCloseButton(): Promise<void> {
    return this.getElement().closeButton().click();
  }

  selectCSVFileType(): Promise<void> {
    return this.getElement().fileTypeRadioButton("CSV").click();
  }

  selectExcelFileType(): Promise<void> {
    return this.getElement().fileTypeRadioButton("Excel").click();
  }
}

export default ExportDelinquencies;
