import type { Page } from "@playwright/test";
import { expectStatus, normalizeText, waitForResponse } from "../../support/native-helpers";

class ManageDelinquencyModal {
  constructor(private readonly page: Page) {}

  private elements() {
    const modal = this.page.locator(".k-dialog");
    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeModalButton: () => modal.locator('button[aria-label="Close"]'),
      explanationTextarea: () => modal.locator("textarea"),
      notRequiredToSubmitFormsCheckbox: () => modal.locator('input[type="checkbox"]'),
      dismissButton: () => modal.getByRole("button", { name: "Dismiss" }),
      cancelButton: () => modal.getByRole("button", { name: "Cancel" }),
      businessNameData: () =>
        modal.locator("label", { hasText: "Business Name (DBA)" }).locator("xpath=following-sibling::*[1]"),
      formTitleData: () =>
        modal.locator("label", { hasText: "Form Title" }).locator("xpath=following-sibling::*[1]"),
      filingPeriodData: () =>
        modal.locator("label", { hasText: "Filing Period" }).locator("xpath=following-sibling::*[1]"),
      dueDateData: () =>
        modal.locator("label", { hasText: "Due Date" }).locator("xpath=following-sibling::*[1]"),
      dismissalExplanationData: () =>
        modal.locator("label", { hasText: "Dismissal Explanation" }).locator("xpath=following-sibling::*[1]"),
      dismisseByData: () =>
        modal.locator("label", { hasText: "Dismissed By" }).locator("xpath=following-sibling::*[1]"),
      revertDismissalButton: () =>
        modal.getByRole("button", { name: "Revert Dismissal" }),
    };
  }
  getElement() {
    return this.elements();
  }

  async clickDismissButton() {
    const dismissPromise = waitForResponse(
      this.page,
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/reports/DismissDelinquencyReport/"),
      () => this.getElement().dismissButton().click()
    );
    const refreshPromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        response.url().includes("/reports/DelinquencyReports/")
    );

    await expectStatus(dismissPromise, 200);
    await expectStatus(refreshPromise, 200);
    await this.page.waitForTimeout(2000);
  }

  clickCancelButton(): Promise<void> {
    return this.getElement().cancelButton().click();
  }

  clickCloseModalButton(): Promise<void> {
    return this.getElement().closeModalButton().click();
  }

  typeExplanation(text: string): Promise<void> {
    return this.getElement().explanationTextarea().fill(text);
  }

  checkNotRequiredToSubmitFormsCheckbox(): Promise<void> {
    return this.getElement().notRequiredToSubmitFormsCheckbox().check();
  }

  async saveBusinessDetails(_variableAlias?: string) {
    return {
      businessName: normalizeText(await this.getElement().businessNameData().textContent()),
      formTitle: normalizeText(await this.getElement().formTitleData().textContent()),
      filingPeriod: normalizeText(await this.getElement().filingPeriodData().textContent()),
    };
  }

  async saveDismissalDetails(_variableAlias?: string) {
    return {
      dismissalExplanation: normalizeText(
        await this.getElement().dismissalExplanationData().textContent()
      ),
      dismissedBy: normalizeText(await this.getElement().dismisseByData().textContent()),
    };
  }

  async clickRevertDismissalButton() {
    const revertPromise = waitForResponse(
      this.page,
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/reports/RevertDismissDelinquencyReport/"),
      () => this.getElement().revertDismissalButton().click()
    );
    await expectStatus(revertPromise, 200);
  }
}

export default ManageDelinquencyModal;
