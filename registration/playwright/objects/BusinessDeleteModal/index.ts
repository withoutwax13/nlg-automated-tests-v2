import { expect, type Page } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";

class BusinessDeleteModal {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      deleteButton: () => this.page.locator(".k-dialog-actions button, .k-dialog button").filter({ hasText: "Delete" }).first(),
      cancelButton: () => this.page.locator(".k-dialog-actions button, .k-dialog button").filter({ hasText: "Cancel" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickDeleteButton() {
    const responsePromise = this.page
      .waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/businesses/"), { timeout: 15000 })
      .catch(() => null);
    await this.getElements().deleteButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async clickCancelButton() {
    await this.getElements().cancelButton().click({ force: true });
  }
}

export default BusinessDeleteModal;
