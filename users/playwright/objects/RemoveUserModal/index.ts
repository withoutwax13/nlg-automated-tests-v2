import { buttonByText, currentPage } from "../../support/runtime";

class RemoveUserModal {
  private elements() {
    return {
      modal: () => currentPage().locator(".k-dialog").first(),
      title: () => currentPage().locator(".k-dialog-title").first(),
      closeModalButton: () => currentPage().locator('button[aria-label="Close"]').first(),
      modalContent: () => currentPage().locator(".k-dialog-content").first(),
      confirmationRadioButton: () => currentPage().locator(".k-checkbox-wrap").first(),
      confirmationLabel: () => currentPage().locator(".k-checkbox-label").first(),
      cancelButton: () => buttonByText("Cancel"),
      deleteButton: () => buttonByText("Delete"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickCloseModalButton() {
    await this.elements().closeModalButton().click();
  }

  async clickCancelButton() {
    await this.elements().cancelButton().click();
  }

  async clickDeleteButton() {
    await this.elements().deleteButton().click();
  }

  async checkConfirmationRadioButton() {
    await this.elements().confirmationRadioButton().click();
  }
}

export default RemoveUserModal;
