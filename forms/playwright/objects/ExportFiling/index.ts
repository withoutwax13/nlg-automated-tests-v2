import { currentPage, withText } from "../../support/runtime";

class ExportFiling {
  private elements() {
    const modal = currentPage().locator(".k-dialog");
    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeButton: () => modal.locator('button[aria-label="Close"]'),
      modalContent: () => modal.locator(".k-dialog-content"),
      fileTypeRadioButton: (type: "CSV" | "Excel") =>
        withText(modal.locator(".k-radio-list label"), type),
      exportFullDataButton: () =>
        withText(modal.locator("button"), "Export Full Data"),
      exportViewButton: () => withText(modal.locator("button"), "Export View"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickExportFullDataButton() {
    await this.getElement().exportFullDataButton().click();
  }

  async clickExportViewButton() {
    await this.getElement().exportViewButton().click();
  }

  async clickCloseButton() {
    await this.getElement().closeButton().click();
  }

  async selectCSVFileType() {
    await this.getElement().fileTypeRadioButton("CSV").click();
  }

  async selectExcelFileType() {
    await this.getElement().fileTypeRadioButton("Excel").click();
  }
}

export default ExportFiling;
