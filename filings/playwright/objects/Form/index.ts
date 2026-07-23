import { type Locator, type Page, type Response } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";

type EntryMethod = "type" | "select" | "click";

class Form {
  constructor(protected readonly page: Page) { }

  private elements() {
    return {
      nextButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first(),
      formTitle: () => this.page.locator("h1"),
      stepper: () => this.page.locator(".k-stepper ol"),
      backButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Back" }).first(),
      saveAndCloseButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Save And Close" }).first(),
      agencyName: () => this.page.locator("#AgencyName"),
      agencyTypeDropdown: () => this.page.locator('div[data-cy="Agency Type-dropdown"], span[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => this.page.locator("#TaxPreparerFullName"),
      preparerTitle: () => this.page.locator("#Title"),
      preparerPhone: () => this.page.locator("#TaxPreparerPhoneNumber"),
      preparerEmailAddress: () => this.page.locator("#PreparerEmail"),
      signature: () => this.page.locator("#Signature"),
      applicantInfoDateData: () => this.page.locator("#Date"),
      anyList: () => this.page.locator("li"),
    };
  }

  getElement() {
    return this.elements();
  }

  private waitForFormPatch() {
    return this.page
      .waitForResponse(
        (response: Response) =>
          response.request().method() === "PATCH" &&
          response.url().includes("/filings/") &&
          response.url().includes("/input?form-id="),
        { timeout: 120000 }
      )
      .catch(() => null);
  }

  async clickNextbutton(isFromFormSteps = true) {
    const patchPromise = isFromFormSteps ? this.waitForFormPatch() : this.page.waitForTimeout(120000);
    const disabledNextButton = await this.getElement().nextButton().getAttribute("disabled");
    if (!disabledNextButton) {
      await this.getElement().nextButton().click({ force: true });
      await patchPromise;
      await waitForLoading(this.page, 2);
    }
  }

  async clickBackButton() {
    await this.getElement().backButton().click({ force: true });
  }

  async clickSaveAndCloseButton() {
    await this.getElement().saveAndCloseButton().click({ force: true });
  }

  async clickStepInStepper(step: number) {
    await this.getElement().stepper().locator("li").nth(step).click({ force: true });
  }

  private async fillTarget(locator: Locator, data: string) {
    const input = locator.locator("input").first();
    if (await input.count()) {
      await input.fill(data);
      return;
    }
    await locator.fill(data);
  }

  async enterData(selector: string, method: EntryMethod, data?: any, selectorCountOnMultiple?: number) {
    if (method === "select" && (data === undefined || data === "")) {
      throw new Error(`Data is required for ${method} method`);
    }

    // await this.page.waitForTimeout(5000);

    const matched = this.page.locator(selector);
    const element = selectorCountOnMultiple === undefined ? matched.first() : matched.nth(selectorCountOnMultiple);

    switch (method) {
      case "type":
        if (data !== undefined && data !== null) await this.fillTarget(element, String(data));
        break;
      case "select":
        await element.click({ force: true });
        await this.getElement().anyList().filter({ hasText: String(data) }).first().click({ force: true });
        break;
      case "click":
        await element.click({ force: true });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // await this.waitForFormPatch();
    // await this.page.waitForTimeout(5000);
  }

  async handleSelectingUnavailableFilingPeriod(counter: number): Promise<void> {
    const date = new Date();
    date.setMonth(date.getMonth() - counter);
    const filingPeriod = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });

    await this.enterData('*[data-cy="Filing Period-dropdown"]', "select", filingPeriod);
    await waitForLoading(this.page, 1);
    const bodyText = await this.page.locator("body").textContent();
    if (bodyText?.includes("You have already filed for this period")) {
      await this.handleSelectingUnavailableFilingPeriod(counter + 1);
    }
  }

  async enterBasicInformation(data?: any) {
    await this.handleSelectingUnavailableFilingPeriod(1);
    await this.enterData("#FEIN", "type", data ?? "123456789");
    await this.enterData("#IllinoisBusinessTax", "type", data ?? "12345678");
    await this.enterData('*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]', "click");
    await this.enterData('*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]', "click");
  }

  async enterTaxInformation(data?: any) {
    await this.enterData("#TotalSales", "type", data ?? "123456");
  }

  async enterPreparerInformation(data?: any) {
    await this.enterData("#TaxPreparerFullName", "type", data ?? "John Doe");
    await this.enterData("#Title", "type", data ?? "Tax Preparer");
    await this.enterData("#Signature", "type", data ?? "John Doe");
    await this.enterData("#TaxPreparerPhoneNumber", "type", data ?? "1234567890");
    await this.enterData("#PreparerEmail", "type", data ?? "test1@test.com");
  }

  async saveAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click({ force: true });
    await this.page.locator(".k-actions button, .k-dialog button").filter({ hasText: "Save and Close" }).first().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async deleteAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click({ force: true });
    await this.page.locator(".k-actions button, .k-dialog button").filter({ hasText: "Delete And Close" }).first().click({ force: true });
    await waitForLoading(this.page, 3);
  }
}

export default Form;
