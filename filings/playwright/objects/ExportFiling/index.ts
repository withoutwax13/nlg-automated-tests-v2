import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";

class ExportFiling {
  private elements(page: Page = resolvePage()) {
    const modal = page.locator(".k-dialog");
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

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async clickExportFullDataButton(page: Page = resolvePage()) {
    await this.getElement(page).exportFullDataButton().click();
  }

  async clickExportViewButton(page: Page = resolvePage()) {
    await this.getElement(page).exportViewButton().click();
  }

  async clickCloseButton(page: Page = resolvePage()) {
    await this.getElement(page).closeButton().click();
  }

  async selectCSVFileType(page: Page = resolvePage()) {
    await this.getElement(page).fileTypeRadioButton("CSV").click();
  }

  async selectExcelFileType(page: Page = resolvePage()) {
    await this.getElement(page).fileTypeRadioButton("Excel").click();
  }
}

export default ExportFiling;
