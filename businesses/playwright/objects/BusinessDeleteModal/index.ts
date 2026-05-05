import { currentPage } from "../../support/runtime";

class BusinessDeleteModal {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    return {
      modalTitle: () => this.page().locator(".k-dialog-title").first(),
      modalContent: () => this.page().locator(".k-dialog-content").first(),
      buttonGroup: () => this.page().locator(".k-dialog-actions").first(),
      cancelButton: () => this.getElement().buttonGroup().locator("button").filter({ hasText: "Cancel" }).first(),
      deleteButton: () => this.getElement().buttonGroup().locator("button").filter({ hasText: "Delete Business" }).first(),
      closeModalButton: () => this.page().locator('button[aria-label="Close"]').first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickDeleteButton() {
    await this.getElement().deleteButton().click();
  }

  async clickCloseModalButton() {
    await this.getElement().closeModalButton().click();
  }
}

export default BusinessDeleteModal;
