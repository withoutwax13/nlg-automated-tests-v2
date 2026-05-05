import type { Page } from "@playwright/test";
import { normalizeText } from "../../support/native-helpers";

class BusinessDetailsModal {
  constructor(private readonly page: Page) {}

  private elements() {
    const modal = this.page.locator(".k-dialog");
    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeModalButton: () => modal.locator('button[aria-label="Close"]'),
      businessNameData: () =>
        modal.locator("label", { hasText: "Business Name" }).locator("xpath=following-sibling::*[1]"),
      dbaData: () => modal.locator("label", { hasText: "DBA" }).locator("xpath=following-sibling::*[1]"),
      businessPropertyData: (propertyName: string) =>
        modal.locator("label", { hasText: propertyName }).locator("xpath=following-sibling::*[1]"),
      remittanceRequirementsList: () =>
        modal.locator("h3", { hasText: "Remittance Requirements" }).locator("xpath=following-sibling::*[1]"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickCloseModalButton(): Promise<void> {
    return this.getElement().closeModalButton().click();
  }

  getBusinessPropertyData(propertyName: string) {
    return this.getElement().businessPropertyData(propertyName);
  }

  async getRemittanceRequirements(_aliasVariable?: string) {
    const listItems = this.getElement().remittanceRequirementsList().locator("li");
    const count = await listItems.count();
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(normalizeText(await listItems.nth(index).textContent()));
    }

    return values;
  }
}
