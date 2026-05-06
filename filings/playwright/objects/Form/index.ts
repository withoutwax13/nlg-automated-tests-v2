import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { waitForLoading } from "../../utils/runtime";

class Form {
  private isPage(value: unknown): value is Page {
    return !!value && typeof value === "object" && "locator" in (value as Record<string, unknown>);
  }

  private elements(page: Page = resolvePage()) {
    return {
      nextButton: () => page.getByRole("button", { name: "Next" }),
      formTitle: () => page.locator("h1"),
      stepper: () => page.locator(".k-stepper ol"),
      backButton: () => page.getByRole("button", { name: "Back" }),
      saveAndCloseButton: () => page.getByRole("button", { name: "Save And Close" }),
      applicantInfoDateData: () => page.locator("#Date"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async clickNextbutton(pageOrIsFromFormSteps?: Page | boolean, isFromFormSteps = true) {
    const page = this.isPage(pageOrIsFromFormSteps) ? pageOrIsFromFormSteps : resolvePage();
    const shouldWait = typeof pageOrIsFromFormSteps === "boolean" ? pageOrIsFromFormSteps : isFromFormSteps;
    await this.elements(page).nextButton().click();
    if (shouldWait) {
      await waitForLoading(page, 1);
    }
  }

  async clickBackButton(page: Page = resolvePage()) {
    await this.elements(page).backButton().click();
  }

  async clickSaveAndCloseButton(page: Page = resolvePage()) {
    await this.elements(page).saveAndCloseButton().click();
  }

  async clickStepInStepper(page: Page = resolvePage(), step: number) {
    await this.elements(page).stepper().locator("li").nth(step).click();
  }

  async enterData(
    page: Page,
    selector: string,
    method: string,
    data?: string,
    selectorCountOnMultiple?: number
  ) {
    const element =
      selectorCountOnMultiple === undefined
        ? page.locator(selector)
        : page.locator(selector).nth(selectorCountOnMultiple);

    switch (method) {
      case "type":
        if (data !== undefined) {
          await element.fill(data);
        }
        break;
      case "select":
        await element.click();
        await page.locator("li").filter({ hasText: data ?? "" }).first().click();
        break;
      case "click":
        await element.click();
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  async handleSelectingUnavailableFilingPeriod(page: Page = resolvePage(), counter: number) {
    const getValidDate = (monthsBack: number): string => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsBack);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    };

    await this.enterData(
      page,
      '*[data-cy="Filing Period-dropdown"]',
      "select",
      getValidDate(counter)
    );
    await waitForLoading(page);

    if ((await page.getByText("You have already filed for this period").count()) > 0) {
      await this.handleSelectingUnavailableFilingPeriod(page, counter + 1);
    }
  }

  async enterBasicInformation(page: Page = resolvePage(), data?: string) {
    await this.handleSelectingUnavailableFilingPeriod(page, 1);
    await this.enterData(page, "#FEIN", "type", data ?? "123456789");
    await this.enterData(page, "#IllinoisBusinessTax", "type", data ?? "12345678");
    await this.enterData(
      page,
      '*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]',
      "click"
    );
    await this.enterData(
      page,
      '*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]',
      "click"
    );
  }

  async enterTaxInformation(page: Page = resolvePage(), data?: string) {
    await this.enterData(page, "#TotalSales", "type", data ?? "123456");
  }

  async enterPreparerInformation(page: Page = resolvePage(), data?: string) {
    await this.enterData(page, "#TaxPreparerFullName", "type", data ?? "John Doe");
    await this.enterData(page, "#Title", "type", data ?? "Tax Preparer");
    await this.enterData(page, "#TaxPreparerPhoneNumber", "type", data ?? "1234567890");
    await this.enterData(page, "#PreparerEmail", "type", data ?? "test1@test.com");
    await this.enterData(page, "#Signature", "type", data ?? "John Doe");
  }

  async saveAndCloseFiling(page: Page = resolvePage()) {
    await this.getElement(page).saveAndCloseButton().click();
    await page.locator(".k-actions button").filter({ hasText: "Save and Close" }).click();
    await waitForLoading(page);
  }

  async deleteAndCloseFiling(page: Page = resolvePage()) {
    await this.getElement(page).saveAndCloseButton().click();
    await page.locator(".k-actions button").filter({ hasText: "Delete And Close" }).click();
    await waitForLoading(page);
  }
}

export default Form;
