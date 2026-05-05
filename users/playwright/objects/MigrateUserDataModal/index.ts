import { buttonByText, currentPage } from "../../support/runtime";

class MigrateUserDataModal {
  private elements() {
    return {
      modal: () => currentPage().locator(".k-dialog").first(),
      title: () => currentPage().locator(".k-dialog-title").first(),
      closeModalButton: () => currentPage().locator('button[aria-label="Close"]').first(),
      modalContent: () => currentPage().locator(".k-dialog-content").first(),
      cancelButton: () => buttonByText("Cancel"),
      migrateButton: () => buttonByText("Migrate"),
      fromEmailInput: () => currentPage().locator("input[name='Email']").first(),
      toEmailInput: () => currentPage().locator("input[name='Email']").last(),
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

  async clickMigrateButton() {
    await this.elements().migrateButton().click();
  }

  async typeFromEmail(email: string) {
    await this.elements().fromEmailInput().fill(email);
  }

  async typeToEmail(email: string) {
    await this.elements().toEmailInput().fill(email);
  }
}

export default MigrateUserDataModal;
