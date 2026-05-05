import { currentPage, listItem, waitForLoading } from "../../support/runtime";

class Form {
  private elements() {
    return {
      nextButton: () => currentPage().locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first(),
      formTitle: () => currentPage().locator("h1").first(),
      stepper: () => currentPage().locator(".k-stepper ol").first(),
      backButton: () => currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Back" }).first(),
      saveAndCloseButton: () =>
        currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Save And Close" }).first(),
      managerOperatorFullName: () =>
        currentPage().locator('span[data-cy="Manager/Operator Full Name-masked-input"]').first(),
      managerOperatorTitle: () => currentPage().locator('input[name="OperatorTitleRB"]').first(),
      managerOperatorPhoneNumber: () => currentPage().locator('input[name="OperatorPhoneRB"]').first(),
      managerOperatorEmail: () => currentPage().locator('input[name="OperatorEmailAddressRB"]').first(),
      managerEmergencyPhoneNumber: () => currentPage().locator('input[name="EmergencyPhoneNumberRB"]').first(),
      agencyName: () => currentPage().locator("#AgencyName").first(),
      agencyTypeDropdown: () => currentPage().locator('div[data-cy="Agency Type-dropdown"]').first(),
      preparerFullName: () => currentPage().locator("#TaxPreparerFullName").first(),
      preparerTitle: () => currentPage().locator("#Title").first(),
      preparerPhone: () => currentPage().locator("#TaxPreparerPhoneNumber").first(),
      preparerEmailAddress: () => currentPage().locator("#PreparerEmail").first(),
      signature: () => currentPage().locator("#Signature").first(),
      agencyCheckbox: () =>
        currentPage().locator('*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]').first(),
      applicantInfoDateData: () => currentPage().locator("#Date").first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickNextbutton() {
    await this.elements().nextButton().click();
  }

  async clickBackButton() {
    await this.elements().backButton().click();
  }

  async clickSaveAndCloseButton() {
    await this.elements().saveAndCloseButton().click();
  }

  async clickStepInStepper(step: number) {
    await this.elements().stepper().locator("li").nth(step).click();
  }

  async enterData(
    selector: string,
    method: string,
    data?: string,
    selectorCountOnMultiple?: number
  ) {
    if (method === "select" && !data) {
      throw new Error(`Data is required for ${method} method`);
    }

    const element = selectorCountOnMultiple === undefined
      ? currentPage().locator(selector).first()
      : currentPage().locator(selector).nth(selectorCountOnMultiple);

    switch (method) {
      case "type":
        if (data) {
          await element.fill(data);
        }
        break;
      case "select":
        await element.click();
        await listItem(data as string).click();
        break;
      case "click":
        await element.click();
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  async handleSelectingUnavailableFilingPeriod(counter: number) {
    const getValidDate = (): string => {
      const date = new Date();
      date.setMonth(date.getMonth() - counter);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    };

    await this.enterData('*[data-cy="Filing Period-dropdown"]', "select", getValidDate());
    await waitForLoading();

    const bodyText = (await currentPage().locator("body").textContent()) || "";
    if (bodyText.includes("You have already filed for this period")) {
      await this.handleSelectingUnavailableFilingPeriod(counter + 1);
    }
  }

  async enterBasicInformation(data?: string) {
    await this.handleSelectingUnavailableFilingPeriod(2);
    await this.enterData("#FEIN", "type", data || "123456789");
    await this.enterData("#IllinoisBusinessTax", "type", data || "12345678");
    await this.enterData('*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]', "click");
    await this.enterData('*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]', "click");
  }

  async enterTaxInformation(data?: string) {
    await this.enterData("#TotalSales", "type", data || "123456");
  }

  async enterPreparerInformation(data?: string) {
    await this.enterData("#TaxPreparerFullName", "type", data || "John Doe");
    await this.enterData("#Title", "type", data || "Tax Preparer");
    await this.enterData("#TaxPreparerPhoneNumber", "type", data || "1234567890");
    await this.enterData("#PreparerEmail", "type", data || "test1@test.com");
    await this.enterData("#Signature", "type", data || "John Doe");
  }

  async saveAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click();
    await currentPage().locator(".k-actions button").filter({ hasText: "Save And Close" }).first().click();
    await waitForLoading();
  }

  async deleteAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click();
    await currentPage().locator(".k-actions button").filter({ hasText: "Delete And Close" }).first().click();
    await waitForLoading();
  }
}

export default Form;
