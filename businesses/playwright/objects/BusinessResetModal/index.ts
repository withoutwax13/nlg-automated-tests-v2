import { buttonByText, currentPage } from "../../support/native-helpers";

class BusinessResetModal {
  private page() {
    return currentPage();
  }

  private elements() {
    return {
      modal: () => this.page().locator(".k-dialog").first(),
      modalTitle: () => this.page().locator(".k-dialog-title").first(),
      modalContent: () => this.page().locator(".k-dialog-content").first(),
      cancelButton: () => buttonByText("Cancel"),
      deleteDataButton: () => buttonByText("Delete Data"),
      sureWantToDeleteDataCheckbox: () => this.page().locator(".k-checkbox-label").first(),
      closeModalButton: () => this.page().locator('button[aria-label="Close"]').first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickDeleteDataButton() {
    await this.getElement().deleteDataButton().click();
  }

  async clickSureWantToDeleteDataCheckbox() {
    await this.getElement().sureWantToDeleteDataCheckbox().click();
  }

  async clickCloseModalButton() {
    await this.getElement().closeModalButton().click();
  }
}

export default BusinessResetModal;
