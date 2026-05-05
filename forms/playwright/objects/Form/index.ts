/**
 * Page Object Model (POM) class representing the form.
 */
class Form {
  /**
   * Get the elements used in the form.
   * @returns {Object} The elements used in the form.
   */
  private elements() {
    return {
      nextButton: () => pw.get(".NLGButtonPrimary").contains("Next"),
      formTitle: () => pw.get("h1"),
      stepper: () => pw.get(".k-stepper").find("ol"),
      getStepper: (step: string) => this.elements().stepper().find(".k-step-text").contains(step).parent().parent(),
      backButton: () => pw.get(".NLGButtonSecondary").contains("Back"),
      saveAndCloseButton: () =>
        pw.get(".NLGButtonSecondary").contains("Save And Close"),
      managerOperatorFullName: () =>
        pw.get('span[data-cy="Manager/Operator Full Name-masked-input"]'),
      managerOperatorTitle: () => pw.get('input[name="OperatorTitleRB"]'),
      managerOperatorPhoneNumber: () => pw.get('input[name="OperatorPhoneRB"]'),
      managerOperatorEmail: () =>
        pw.get('input[name="OperatorEmailAddressRB"]'),
      managerEmergencyPhoneNumber: () =>
        pw.get('input[name="EmergencyPhoneNumberRB"]'),
      agencyName: () => pw.get("#AgencyName"),
      agencyTypeDropdown: () => pw.get('div[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => pw.get("#TaxPreparerFullName"),
      preparerTitle: () => pw.get("#Title"),
      preparerPhone: () => pw.get("#TaxPreparerPhoneNumber"),
      preparerEmailAddress: () => pw.get("#PreparerEmail"),
      signature: () => pw.get("#Signature"),
      agencyCheckbox: () =>
        pw.get(
          '*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]'
        ),
      applicantInfoDateData: () => pw.get("#Date"),
      skipRequiredFieldsCheckbox: () => pw.get("[for='checkbox-AGS-Nav']"),
      overrideEnabledInfoText: () => pw.get(".fa-exclamation-triangle").parent(),
    };
  }

  /**
   * Get the elements used in the form.
   * @returns {Object} The elements used in the form.
   */
  getElement() {
    return this.elements();
  }

  /**
   * Click the next button.
   */
  clickNextbutton() {
    this.elements().nextButton().click();
  }

  /**
   * Click the back button.
   */
  clickBackButton() {
    this.elements().backButton().click();
  }

  /**
   * Click the save and close button.
   */
  clickSaveAndCloseButton() {
    this.elements().saveAndCloseButton().click();
  }

  /**
   * Click a step in the stepper.
   * @param {number} step - The step number to click.
   */
  clickStepInStepper(step: number) {
    this.elements().stepper().find("li").eq(step).click();
  }

  /**
   * Enter data into a form field.
   * @param {string} selector - The selector of the form field.
   * @param {string} method - The method to use (type, select, click).
   * @param {any} [data] - The data to enter.
   * @param {number} [selectorCountOnMultiple] - The index if multiple elements are matched.
   */
  enterData(
    selector: string,
    method: string,
    data?: any,
    selectorCountOnMultiple?: number
  ) {
    if (["select"].includes(method) && (data === undefined || data === "")) {
      throw new Error(`Data is required for ${method} method`);
    }

    const element =
      selectorCountOnMultiple === undefined
        ? pw.get(selector)
        : pw.get(selector).eq(selectorCountOnMultiple);

    switch (method) {
      case "type":
        if (data) {
          element.type(data);
        }
        break;
      case "select":
        element.click();
        pw.get("li").contains(data).click();
        break;
      case "click":
        element.click();
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  handleSelectingUnavailableFilingPeriod(_counter: number) {
    let counter = _counter;
    const getValidDate = (): string => {
      const date = new Date();
      date.setMonth(date.getMonth() - counter);

      const options = { year: "numeric", month: "long" } as const;
      return date.toLocaleDateString("en-US", options);
    };

    this.enterData(
      '*[data-cy="Filing Period-dropdown"]',
      "select",
      getValidDate()
    );
    pw.waitForLoading();
    pw.get("div").then(($el) => {
      if ($el.text().includes("You have already filed for this period")) {
        this.handleSelectingUnavailableFilingPeriod(++counter);
      }
    });
  }

  enterBasicInformation(data?: any) {
    this.handleSelectingUnavailableFilingPeriod(1); // 4 months ago
    // this.enterData(
    //   '*[data-cy="Business Location State-dropdown"]',
    //   "select",
    //   data ? data : "AK"
    // );
    this.enterData("#FEIN", "type", data ? data : "123456789");
    this.enterData("#IllinoisBusinessTax", "type", data ? data : "12345678");
    this.enterData(
      '*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]',
      "click"
    );
    this.enterData(
      '*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]',
      "click"
    );
  }

  enterTaxInformation(data?: any) {
    this.enterData("#TotalSales", "type", data ? data : "123456");
  }

  enterPreparerInformation(data?: any) {
    this.enterData("#TaxPreparerFullName", "type", data ? data : "John Doe");
    this.enterData("#Title", "type", data ? data : "Tax Preparer");
    this.enterData(
      "#TaxPreparerPhoneNumber",
      "type",
      data ? data : "1234567890"
    );
    this.enterData("#PreparerEmail", "type", data ? data : "test1@test.com");
    this.enterData("#Signature", "type", data ? data : "John Doe");
  }

  saveAndCloseFiling() {
    this.getElement().saveAndCloseButton().click();
    // TODO: Add save and close modal POM
    pw.get('.k-actions').find('button').contains('Save And Close').click();
    pw.waitForLoading();
  }

  deleteAndCloseFiling() {
    this.getElement().saveAndCloseButton().click();
    // TODO: Add save and close modal POM
    pw.get('.k-actions').find('button').contains('Delete And Close').click();
    pw.waitForLoading();
  }

  clickSkipRequiredFieldsCheckbox() {
    this.getElement().skipRequiredFieldsCheckbox().click();
  }
}

export default Form;
