import type { Page } from "@playwright/test";
import { clickByText, setMaskedDateInput, waitForLoading } from "../../support/native-helpers";

class SetBusinessStatusModal {
  private page!: Page;
  async init(page: Page) { this.page = page; }
  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").first(),
      modalTitle: () => this.page.locator(".k-dialog-title").first(),
      businessCloseDateInput: () => this.page.locator("label").filter({ hasText: "Business Close Date" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      lastAcceptFilingDateInput: () => this.page.locator("label").filter({ hasText: "Last date to accept filings/applications" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      businessStatusDropdown: () => this.page.locator("label").filter({ hasText: "Business Status" }).first().locator("xpath=following-sibling::*[1]").first(),
      saveButton: () => this.page.locator(".k-dialog button").filter({ hasText: "Save" }).first(),
      cancelButton: () => this.page.locator(".k-dialog button").filter({ hasText: "Cancel" }).first(),
      closeButton: () => this.page.locator(".k-dialog button[aria-label='Close']").first(),
      anyList: () => this.page.locator("li"),
    };
  }
  getElement() { return this.elements(); }
  async clickSaveButton() { await this.getElement().saveButton().click(); await waitForLoading(this.page); }
  async clickCancelButton() { await this.getElement().cancelButton().click(); }
  async clickCloseButton() { await this.getElement().closeButton().click(); }
  async setBusinessCloseDate(date: { month: number; date: number; year: number }) { await setMaskedDateInput(this.getElement().businessCloseDateInput(), date); }
  async setLastAcceptFilingDate(date: { month: number; date: number; year: number }) { await setMaskedDateInput(this.getElement().lastAcceptFilingDateInput(), date); }
  async setBusinessStatus(status: string) { await this.getElement().businessStatusDropdown().click(); await clickByText(this.getElement().anyList(), status); }
}

export default SetBusinessStatusModal;
