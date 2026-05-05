import { buttonByText, currentPage } from "../../support/runtime";

class EditUserModal {
  private elements() {
    return {
      modal: () => currentPage().locator(".k-dialog").first(),
      title: () => currentPage().locator(".k-dialog-title").first(),
      closeModalButton: () => currentPage().locator('button[aria-label="Close"]').first(),
      modalContent: () => currentPage().locator(".k-dialog-content").first(),
      isEnabledRadioButton: () => currentPage().locator(".k-checkbox-wrap").first(),
      isEnabledLabel: () => currentPage().locator(".k-checkbox-label").first(),
      cancelButton: () => buttonByText("Cancel"),
      updateButton: () => buttonByText("Update"),
      firstNameInput: () => currentPage().locator("input[name='FirstName']").first(),
      lastNameInput: () => currentPage().locator("input[name='LastName']").first(),
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

  async clickUpdateButton() {
    await this.elements().updateButton().click();
  }

  async checkIsEnabledRadioButton() {
    await this.elements().isEnabledRadioButton().click();
  }

  async typeFirstName(firstName: string) {
    await this.elements().firstNameInput().fill(firstName);
  }

  async typeLastName(lastName: string) {
    await this.elements().lastNameInput().fill(lastName);
  }
}

export default EditUserModal;
