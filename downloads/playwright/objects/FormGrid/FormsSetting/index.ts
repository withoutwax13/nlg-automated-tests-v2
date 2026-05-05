import type { Page } from "@playwright/test";

class FormsSetting {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private elements() {
    return {
      saveButton: () => this.page.locator(".k-actions button").filter({ hasText: "Save" }).first(),
      cancelButton: () => this.page.locator(".k-actions button").filter({ hasText: "Cancel" }).first(),
      municipalityDropdown: () =>
        this.page.locator('input[placeholder="Search government and press enter …"]').first(),
      anyList: () => this.page.locator("li"),
      forms: () => this.page.locator(".k-list-item"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickSaveButton() {
    await this.getElement().saveButton().click();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().municipalityDropdown().fill(municipality);
    await this.getElement().anyList().filter({ hasText: municipality }).first().click();
  }

  async saveFormOrders() {
    const count = await this.getElement().forms().count();
    const formsOrder: string[] = [];

    for (let index = 0; index < count; index += 1) {
      formsOrder.push((await this.getElement().forms().nth(index).innerText()).trim());
    }

    return formsOrder;
  }
}

export default FormsSetting;
