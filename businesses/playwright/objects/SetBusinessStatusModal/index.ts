import { currentPage, fillDateInput, listItem, waitForLoading } from "../../helpers/legacy-helpers";

class SetBusinessStatusModal {
  private page() {
    return currentPage();
  }

  private elements() {
    return {
      modal: () => this.page().locator(".k-dialog").first(),
      modalTitle: () => this.elements().modal().locator(".k-dialog-title").first(),
      businessCloseDateInput: () =>
        this.getElement().modal().locator("label").filter({ hasText: "Business Close Date" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      lastAcceptFilingDateInput: () =>
        this.getElement()
          .modal()
          .locator("label")
          .filter({ hasText: "Last date to accept filings/applications" })
          .first()
          .locator("xpath=following-sibling::*[1]")
          .locator("input")
          .first(),
      businessStatusDropdown: () =>
        this.getElement().modal().locator("label").filter({ hasText: "Business Status" }).first().locator("xpath=following-sibling::*[1]").first(),
      saveButton: () => this.getElement().modal().locator("button").filter({ hasText: "Save" }).first(),
      cancelButton: () => this.getElement().modal().locator("button").filter({ hasText: "Cancel" }).first(),
      closeButton: () => this.getElement().modal().locator("button[aria-label='Close']").first(),
      anyList: () => this.page().locator("li"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickSaveButton() {
    await this.getElement().saveButton().click();
    await waitForLoading();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickCloseButton() {
    await this.getElement().closeButton().click();
  }

  async setBusinessCloseDate(date: { month: number; date: number; year: number }) {
    await fillDateInput(this.getElement().businessCloseDateInput(), date);
  }

  async setLastAcceptFilingDate(date: { month: number; date: number; year: number }) {
    await fillDateInput(this.getElement().lastAcceptFilingDateInput(), date);
  }

  async setBusinessStatus(status: string) {
    await this.getElement().businessStatusDropdown().click();
    await listItem(status).click();
  }
}

export default SetBusinessStatusModal;
