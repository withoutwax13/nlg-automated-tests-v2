import { currentPage, waitForLoading, withText } from "../../support/runtime";

class Form {
  private elements() {
    const page = currentPage();
    const stepper = page.locator(".k-stepper ol");

    return {
      nextButton: () => withText(page.locator(".NLGButtonPrimary"), "Next"),
      formTitle: () => page.locator("h1"),
      stepper: () => stepper,
      getStepper: (step: string) =>
        withText(stepper.locator(".k-step-text"), step).locator("xpath=../.."),
      backButton: () => withText(page.locator(".NLGButtonSecondary"), "Back"),
      saveAndCloseButton: () =>
        withText(page.locator(".NLGButtonSecondary"), "Save And Close"),
      managerOperatorFullName: () =>
        page.locator('span[data-cy="Manager/Operator Full Name-masked-input"]'),
      managerOperatorTitle: () => page.locator('input[name="OperatorTitleRB"]'),
      managerOperatorPhoneNumber: () =>
        page.locator('input[name="OperatorPhoneRB"]'),
      managerOperatorEmail: () =>
        page.locator('input[name="OperatorEmailAddressRB"]'),
      managerEmergencyPhoneNumber: () =>
        page.locator('input[name="EmergencyPhoneNumberRB"]'),
      agencyName: () => page.locator("#AgencyName"),
      agencyTypeDropdown: () => page.locator('div[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => page.locator("#TaxPreparerFullName"),
      preparerTitle: () => page.locator("#Title"),
      preparerPhone: () => page.locator("#TaxPreparerPhoneNumber"),
      preparerEmailAddress: () => page.locator("#PreparerEmail"),
      signature: () => page.locator("#Signature"),
      agencyCheckbox: () =>
        page.locator(
          '*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]'
        ),
      applicantInfoDateData: () => page.locator("#Date"),
      skipRequiredFieldsCheckbox: () => page.locator("[for='checkbox-AGS-Nav']"),
      overrideEnabledInfoText: () =>
        page.locator(".fa-exclamation-triangle").locator("xpath=.."),
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

    const target =
      selectorCountOnMultiple === undefined
        ? currentPage().locator(selector).first()
        : currentPage().locator(selector).nth(selectorCountOnMultiple);

    if (method === "type") {
      if (data) {
        await target.fill("");
        await target.type(data);
      }
      return;
    }

    if (method === "select") {
      await target.click();
      await currentPage().locator("li").filter({ hasText: data }).first().click();
      return;
    }

    if (method === "click") {
      await target.click();
      return;
    }

    throw new Error(`Unsupported method: ${method}`);
  }

  async handleSelectingUnavailableFilingPeriod(counter: number) {
    const getValidDate = () => {
      const date = new Date();
      date.setMonth(date.getMonth() - counter);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    };

    await this.enterData('*[data-cy="Filing Period-dropdown"]', "select", getValidDate());
    await waitForLoading();

    if (
      (await currentPage()
        .locator("div")
        .filter({ hasText: "You have already filed for this period" })
        .count()) > 0
    ) {
      await this.handleSelectingUnavailableFilingPeriod(counter + 1);
    }
  }

  async enterBasicInformation(data?: string) {
    await this.handleSelectingUnavailableFilingPeriod(1);
    await this.enterData("#FEIN", "type", data ?? "123456789");
    await this.enterData("#IllinoisBusinessTax", "type", data ?? "12345678");
    await this.enterData(
      '*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]',
      "click"
    );
    await this.enterData(
      '*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]',
      "click"
    );
  }

  async enterTaxInformation(data?: string) {
    await this.enterData("#TotalSales", "type", data ?? "123456");
  }

  async enterPreparerInformation(data?: string) {
    await this.enterData("#TaxPreparerFullName", "type", data ?? "John Doe");
    await this.enterData("#Title", "type", data ?? "Tax Preparer");
    await this.enterData("#TaxPreparerPhoneNumber", "type", data ?? "1234567890");
    await this.enterData("#PreparerEmail", "type", data ?? "test1@test.com");
    await this.enterData("#Signature", "type", data ?? "John Doe");
  }

  async saveAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click();
    await withText(currentPage().locator(".k-actions button"), "Save And Close").click();
    await waitForLoading();
  }

  async deleteAndCloseFiling() {
    await this.getElement().saveAndCloseButton().click();
    await withText(currentPage().locator(".k-actions button"), "Delete And Close").click();
    await waitForLoading();
  }

  async clickSkipRequiredFieldsCheckbox() {
    await this.getElement().skipRequiredFieldsCheckbox().click();
  }
}

export default Form;
