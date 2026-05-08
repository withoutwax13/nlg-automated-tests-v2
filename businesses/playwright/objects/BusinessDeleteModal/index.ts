import type { Page } from "@playwright/test";

class BusinessDeleteModal {
  userType: string;
  page: Page;

  constructor(props: { userType: string; page?: Page }) {
    this.userType = props.userType;
    if (props.page) this.page = props.page;
  }
  private elements() {
    const modal = this.page.locator(".k-dialog");
    return {
      modalTitle: () => modal.locator(".k-dialog-title"),
      modalContent: () => modal.locator(".k-dialog-content"),
      buttonGroup: () => modal.locator(".k-dialog-actions"),
      cancelButton: () =>
        this.getElement()
          .buttonGroup()
          .locator(".NLGButtonPrimary")
          .filter({ hasText: "Cancel" })
          .first(),
      deleteButton: () =>
        this.getElement()
          .buttonGroup()
          .locator(".NLGButtonSecondary")
          .filter({ hasText: "Delete Business" })
          .first(),
      closeModalButton: () => modal.locator('button[aria-label="Close"]'),
    };
  }
  getElement() {
    return this.elements();
  }

  async init(page: Page) {
    this.page = page;
  }

  clickCancelButton(): Promise<void> {
    return this.getElement().cancelButton().click();
  }

  clickDeleteButton(): Promise<void> {
    return this.getElement().deleteButton().click();
  }

  clickCloseModalButton(): Promise<void> {
    return this.getElement().closeModalButton().click();
  }
}

export default BusinessDeleteModal;
