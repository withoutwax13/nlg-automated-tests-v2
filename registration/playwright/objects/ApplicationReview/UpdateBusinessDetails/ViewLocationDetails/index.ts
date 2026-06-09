import { type Page } from "@playwright/test";

class ViewLocationDetails {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").last(),
      closeButton: () => this.page.locator(".k-dialog button").filter({ hasText: /Close|Cancel/ }).last(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickCloseButton() {
    await this.getElements().closeButton().click({ force: true });
  }
}

export default ViewLocationDetails;
