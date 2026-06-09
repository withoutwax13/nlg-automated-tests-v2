import { expect, type Locator, type Page } from "@playwright/test";
import { setMaskedDateInput, waitForLoading } from "../../../../../support/native-helpers";

class FormRequirements {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      modal: () => this.page.locator(".k-dialog").last(),
      modalTitle: () => this.page.locator(".k-dialog-title").last(),
      formRows: () => this.page.locator(".k-dialog-content label, .k-dialog-content .k-checkbox-wrap, .k-dialog-content div"),
      startDateDelinquencyTracker: () => this.page.locator(".k-dialog .k-dateinput input").last(),
      saveButton: () => this.page.locator(".k-dialog .NLGButtonPrimary, .k-dialog button").filter({ hasText: "Save" }).last(),
    };
  }

  getElements() {
    return this.elements();
  }

  private async formCheckbox(formName: string): Promise<Locator> {
    const row = this.page.locator(".k-dialog-content").locator("label, div").filter({ hasText: formName }).first();
    const directInput = row.locator("input").first();
    if (await directInput.count()) return directInput;
    const precedingInput = row.locator("xpath=preceding::input[1]");
    if (await precedingInput.count()) return precedingInput;
    return row;
  }

  async enableForm(formName: string) {
    const checkbox = await this.formCheckbox(formName);
    const checked = await checkbox.isChecked().catch(() => false);
    if (!checked) await checkbox.click({ force: true });
  }

  async disableForm(formName: string) {
    const checkbox = await this.formCheckbox(formName);
    const checked = await checkbox.isChecked().catch(() => false);
    if (checked) await checkbox.click({ force: true });
  }

  async selectDateDelinquencyTrackingStartDate(month: string | number, date: string | number, year: string | number) {
    await setMaskedDateInput(this.getElements().startDateDelinquencyTracker(), { month, date, year });
  }

  async clickSaveButton() {
    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          (response.url().includes("/registrations/") || response.url().includes("/businesses/")),
        { timeout: 15000 }
      )
      .catch(() => null);
    await expect(this.getElements().saveButton()).toBeEnabled();
    await this.getElements().saveButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 5);
  }
}

export default FormRequirements;
