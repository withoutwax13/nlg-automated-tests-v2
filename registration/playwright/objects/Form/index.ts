/**
 * Page Object Model (POM) class representing the form.
 */
class Form {
  isRenewal: boolean;

  /**
   * Create a form.
   * @param {Object} props - The properties of the form.
   * @param {boolean} props.isRenewal - Indicates if the form is for renewal.
   */
  constructor(props: { isRenewal: boolean }) {
    this.isRenewal = props.isRenewal;
  }

  /**
   * Get the elements used in the form.
   * @returns {Object} The elements used in the form.
   */
  private elements() {
    return {
      nextButton: () => pw.get(".NLGButtonPrimary").contains("Next"),
      formTitle: () => pw.get("h1"),
      stepper: () => pw.get(".k-stepper").find("ol"),
      backButton: () => pw.get(".NLGButtonSecondary").contains("Back"),
      saveAndCloseButton: () =>
        pw.get(".NLGButtonSecondary").contains("Save And Close"),
      addLocationButton: () =>
        pw.get(".NLGButtonPrimary").contains("Add Location"),
      removeLocationButton: () =>
        pw.get(".NLGButtonSecondary").contains("Remove"),
      ownerFullName: () => pw.get("#OwnerFullName"),
      ownerPhoneNumber: () => pw.get("#OwnerPhoneNumber"),
      ownerEmailAddress: () => pw.get("#OwnerEmailAddress"),
      businessName: () => pw.get("#BusinessName"),
      fein: () => pw.get("#FEIN"),
      businessAddress1: () => pw.get("#BusinessAddress1"),
      businessAddress2: () => pw.get("#BusinessAddress2"),
      businessCity: () => pw.get("#BusinessCity"),
      businessStateDropdown: () =>
        pw.get('span[data-cy="Legal Business State-dropdown"]'),
      businessZipCode: () => pw.get("#BusinessZipCode"),
      noRadioButton: () => pw.get('input[data-cy="No-radio-button"]'),
      legalBusinessAddressCheckbox: () =>
        pw.get(
          'input[data-cy="Check this box if the Legal Business Address is the same as the Business Mailing Address-checkbox"]'
        ),
      businessOwnerInfoCheckbox: () =>
        pw.get(
          'input[data-cy="Check this box if the Business Owner Information is the same as the Business Management Contact Information-checkbox"]'
        ),
      emergencyPhoneNumber: () => pw.get("#EmergencyPhoneNumber"),
      locationOpenDate: () =>
        cy
          .get('span[data-cy="Location Open Date-datePicker-input"]')
          .find("input"),
      locationDBA: () =>
        pw.get('span[data-cy="Location Trade Name DBA-masked-input"]'),
      locationAddress1: () =>
        pw.get('span[data-cy="Location Address 1-masked-input"]'),
      locationAddress2: () =>
        pw.get('span[data-cy="Location Address 2-masked-input"]'),
      locationCity: () => pw.get('span[data-cy="Location City-masked-input"]'),
      locationStateDropdown: () =>
        pw.get('span[data-cy="Location State-dropdown"]'),
      locationZipCode: () =>
        pw.get('span[data-cy="Location Zip Code-masked-input"]'),
      locationMailingAddress1: () =>
        pw.get('span[data-cy="Business Mailing Address 1-masked-input"]'),
      locationMailingAddress2: () =>
        pw.get('span[data-cy="Business Mailing Address 2-masked-input"]'),
      locationMailingCity: () =>
        pw.get('span[data-cy="Business Mailing City-masked-input"]'),
      locationMailingStateDropdown: () =>
        pw.get('span[data-cy="Business Mailing State-dropdown"]'),
      locationMailingZipCode: () =>
        pw.get('span[data-cy="Business Mailing Zip Code-masked-input"]'),
      managerOperatorFullName: () =>
        pw.get('span[data-cy="Manager/Operator Full Name-masked-input"]'),
      managerOperatorTitle: () => pw.get('input[name="OperatorTitleRB"]'),
      managerOperatorPhoneNumber: () => pw.get('input[name="OperatorPhoneRB"]'),
      managerOperatorEmail: () =>
        pw.get('input[name="OperatorEmailAddressRB"]'),
      managerEmergencyPhoneNumber: () =>
        pw.get('input[name="EmergencyPhoneNumberRB"]'),
      agencyName: () => pw.get("#AgencyName"),
      agencyTypeDropdown: () => pw.get('span[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => pw.get("#PreparerFullName"),
      preparerTitle: () => pw.get("#PreparerTitle"),
      preparerPhone: () => pw.get("#PreparerPhone"),
      preparerEmailAddress: () => pw.get("#PreparerEmailAddress"),
      signature: () => pw.get("#Signature"),
      agencyCheckbox: () =>
        pw.get(
          '*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]'
        ),
      yesMultipleLocationsRadioButton: () =>
        pw.get(
          'input[data-cy="Yes, I will be registering multiple business locations.-radio-button"]'
        ),
      noSingleLocationRadioButton: () =>
        pw.get(
          'input[data-cy="No, I will only be registering a single business.-radio-button"]'
        ),
      applicantInfoDateData: () => pw.get("#Date"),
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
    this.elements().nextButton().click( {force: true} );
  }

  /**
   * Click the back button.
   */
  clickBackButton() {
    this.elements().backButton().click( {force: true} );
  }

  /**
   * Click the add location button.
   */
  clickAddLocationButton() {
    this.elements().addLocationButton().click( {force: true} );
  }

  /**
   * Click the remove location button.
   */
  clickRemoveLocationButton() {
    this.elements().removeLocationButton().click( {force: true} );
  }

  /**
   * Click the save and close button.
   */
  clickSaveAndCloseButton() {
    this.elements().saveAndCloseButton().click( {force: true} );
  }

  /**
   * Click a step in the stepper.
   * @param {number} step - The step number to click.
   */
  clickStepInStepper(step: number) {
    this.elements().stepper().find("li").eq(step).click( {force: true} );
  }

  /**
   * Click the add location button.
   */
  addLocation() {
    this.elements().addLocationButton().click( {force: true} );
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
        element.click( {force: true} );
        pw.get("li").contains(data).click( {force: true} );
        break;
      case "click":
        element.click( {force: true} );
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  /**
   * Select if registering multiple locations.
   * @param {boolean} toRegisterMultipleLocations - Indicates if multiple locations are being registered.
   */
  selectIsRegisteringMultipleLocations(toRegisterMultipleLocations: boolean) {
    if (toRegisterMultipleLocations) {
      this.enterData(
        'input[data-cy="Yes, I will be registering multiple business locations.-radio-button"]',
        "click"
      );
    } else {
      this.enterData(
        'input[data-cy="No, I will only be registering a single business.-radio-button"]',
        "click"
      );
    }
  }

  /**
   * Enter business owner information.
   * @param {Object} data - The business owner information.
   * @param {string} data.businessOwnerFullName - The full name of the business owner.
   * @param {string} data.businessOwnerPhoneNumber - The phone number of the business owner.
   * @param {string} data.businessOwnerEmail - The email of the business owner.
   */
  enterBusinessOwnerInformation(data: {
    businessOwnerFullName: string;
    businessOwnerPhoneNumber: string;
    businessOwnerEmail: string;
  }) {
    this.enterData("#OwnerFullName", "type", data.businessOwnerFullName);
    this.enterData("#OwnerPhoneNumber", "type", data.businessOwnerPhoneNumber);
    this.enterData("#OwnerEmailAddress", "type", data.businessOwnerEmail);
  }

  /**
   * Enter legal business information.
   * @param {Object} data - The legal business information.
   * @param {string} data.legalBusinessName - The legal business name.
   * @param {string} data.legalBusinessAddress1 - The first line of the legal business address.
   * @param {string} data.legalBusinessAddress2 - The second line of the legal business address.
   * @param {string} data.legalBusinessCity - The city of the legal business.
   * @param {string} data.legalBusinessState - The state of the legal business.
   * @param {string} data.legalBusinessZipCode - The ZIP code of the legal business.
   * @param {string} data.federalIdentificationNumber - The FEIN of the legal business.
   */
  enterLegalBusinessInformation(data: {
    legalBusinessName: string;
    legalBusinessAddress1: string;
    legalBusinessAddress2: string;
    legalBusinessCity: string;
    legalBusinessState: string;
    legalBusinessZipCode: string;
    federalIdentificationNumber: string;
  }) {
    this.enterData("#BusinessName", "type", data.legalBusinessName);
    this.enterData("#FEIN", "type", data.federalIdentificationNumber);
    this.enterData("#BusinessAddress1", "type", data.legalBusinessAddress1);
    this.enterData("#BusinessAddress2", "type", data.legalBusinessAddress2);
    this.enterData("#BusinessCity", "type", data.legalBusinessCity);
    this.enterData(
      'span[data-cy="Legal Business State-dropdown"]',
      "select",
      data.legalBusinessState
    );
    this.enterData("#BusinessZipCode", "type", data.legalBusinessZipCode);
  }

  /**
   * Check for consistent legal business address and business owner information.
   */
  checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation() {
    this.enterData('input[data-cy="No-radio-button"]', "click");
    pw.waitForLoading();
    this.enterData(
      'input[data-cy="Check this box if the Legal Business Address is the same as the Business Mailing Address-checkbox"]',
      "click"
    );
    this.enterData(
      'input[data-cy="Check this box if the Business Owner Information is the same as the Business Management Contact Information-checkbox"]',
      "click"
    );
  }

  /**
   * Enter emergency phone numbers.
   * @param {Object} data - The emergency phone number information.
   * @param {string} data.emergencyPhoneNumber - The emergency phone number.
   */
  enterEmergencyPhoneNumbers(data: { emergencyPhoneNumber: string }) {
    this.enterData("#EmergencyPhoneNumber", "type", data.emergencyPhoneNumber);
  }

  private recursiveDateInput(props: {
    date: { month: number; day: number; year: number };
    selector: string;
    intendedDateValue: string;
    index?: number;
  }) {
    /**
     * Recursively enter a date in case flaky behavior occurs.
     * @param {Object} props.date - The date to enter.
     * @param {string} props.selector - The selector of the date input.
     * @param {string} props.intendedDateValue - The intended date value to enter.
     */
    const enter = (selector: string, method: string, value: any) =>
      this.enterData(selector, method, value, props.index);

    enter(props.selector, "type", `${props.date.month}`);
    this.getElement().formTitle().click( {force: true} );
    enter(props.selector, "type", `{rightarrow}${props.date.day}`);
    this.getElement().formTitle().click( {force: true} );
    enter(props.selector, "type", `{rightarrow}{rightarrow}${props.date.year}`);
    this.getElement().formTitle().click( {force: true} );
    pw.get(`${props.selector} input`)
      .eq(props.index ? props.index : 0)
      .invoke("attr", "value")
      .then((dateValue) => {
        if (dateValue !== props.intendedDateValue) {
          enter(props.selector, "type", `{backspace}`);
          enter(props.selector, "type", `{leftArrow}{backspace}`);
          enter(props.selector, "type", `{leftArrow}{leftArrow}{backspace}`);
          this.recursiveDateInput(props);
        }
      });
  }

  /**
   * Enter location details.
   * @param {Object[]} data - The location details.
   * @param {Object} data[].locationOpenDate - The open date of the location.
   * @param {number} data[].locationOpenDate.day - The day of the open date.
   * @param {number} data[].locationOpenDate.month - The month of the open date.
   * @param {number} data[].locationOpenDate.year - The year of the open date.
   * @param {string} data[].locationDBA - The DBA of the location.
   * @param {string} data[].locationAddress1 - The first line of the location address.
   * @param {string} data[].locationAddress2 - The second line of the location address.
   * @param {string} data[].locationCity - The city of the location.
   * @param {string} data[].locationState - The state of the location.
   * @param {string} data[].locationZip - The ZIP code of the location.
   * @param {string} data[].locationMailingAddress1 - The first line of the location mailing address.
   * @param {string} data[].locationMailingAddress2 - The second line of the location mailing address.
   * @param {string} data[].locationMailingCity - The city of the location mailing address.
   * @param {string} data[].locationMailingState - The state of the location mailing address.
   * @param {string} data[].locationMailingZip - The ZIP code of the location mailing address.
   * @param {string} data[].managerOperatorFullName - The full name of the manager/operator.
   * @param {string} data[].managerOperatorPhoneNumber - The phone number of the manager/operator.
   * @param {string} data[].managerOperatorEmail - The email of the manager/operator.
   * @param {string} data[].managerOperatorTitle - The title of the manager/operator.
   * @param {string} data[].emergencyPhoneNumber - The emergency phone number.
   */
  enterLocationDetails(
    data: {
      locationOpenDate: { day: number; month: number; year: number };
      locationDBA: string;
      locationAddress1: string;
      locationAddress2: string;
      locationCity: string;
      locationState: string;
      locationZip: string;
      locationMailingAddress1: string;
      locationMailingAddress2: string;
      locationMailingCity: string;
      locationMailingState: string;
      locationMailingZip: string;
      managerOperatorFullName: string;
      managerOperatorPhoneNumber: string;
      managerOperatorEmail: string;
      managerOperatorTitle: string;
      emergencyPhoneNumber: string;
    }[]
  ) {
    data.forEach((location, index) => {
      const enter = (selector: string, method: string, value: any) =>
        this.enterData(
          selector,
          method,
          value,
          data.length > 1 ? index : undefined
        );

      // enter(
      //   'span[data-cy="Location Open Date-datePicker-input"] input',
      //   "type",
      //   `${location.locationOpenDate.month}{rightarrow}${location.locationOpenDate.day}{rightarrow}${location.locationOpenDate.year}`
      // );

      this.recursiveDateInput({
        date: location.locationOpenDate,
        selector: 'span[data-cy="Location Open Date-datePicker-input"]',
        intendedDateValue: `${location.locationOpenDate.month}/${location.locationOpenDate.day}/${location.locationOpenDate.year}`,
        index,
      });

      enter(
        'span[data-cy="Location Trade Name DBA-masked-input"]',
        "type",
        location.locationDBA
      );
      enter(
        'span[data-cy="Location Address 1-masked-input"]',
        "type",
        location.locationAddress1
      );
      enter(
        'span[data-cy="Location Address 2-masked-input"]',
        "type",
        location.locationAddress2
      );
      enter(
        'span[data-cy="Location City-masked-input"]',
        "type",
        location.locationCity
      );
      enter(
        'span[data-cy="Location State-dropdown"]',
        "select",
        location.locationState
      );
      enter(
        'span[data-cy="Location Zip Code-masked-input"]',
        "type",
        location.locationZip
      );

      if (data.length > 1) {
        enter(
          'span[data-cy="Business Mailing Address 1-masked-input"]',
          "type",
          location.locationMailingAddress1
        );
        enter(
          'span[data-cy="Business Mailing Address 2-masked-input"]',
          "type",
          location.locationMailingAddress2
        );
        enter(
          'span[data-cy="Business Mailing City-masked-input"]',
          "type",
          location.locationMailingCity
        );
        enter(
          'span[data-cy="Business Mailing State-dropdown"]',
          "select",
          location.locationMailingState
        );
        enter(
          'span[data-cy="Business Mailing Zip Code-masked-input"]',
          "type",
          location.locationMailingZip
        );
        enter(
          'span[data-cy="Manager/Operator Full Name-masked-input"]',
          "type",
          location.managerOperatorFullName
        );
        enter(
          'input[name="OperatorTitleRB"]',
          "type",
          location.managerOperatorTitle
        );
        enter(
          'input[name="OperatorPhoneRB"]',
          "type",
          location.managerOperatorPhoneNumber
        );
        enter(
          'input[name="OperatorEmailAddressRB"]',
          "type",
          location.managerOperatorEmail
        );
        enter(
          'input[name="EmergencyPhoneNumberRB"]',
          "type",
          location.emergencyPhoneNumber
        );
      }
      index < data.length - 1 && this.addLocation();
      pw.waitForLoading();
    });
  }

  /**
   * Enter applicant details.
   * @param {Object} data - The applicant details.
   * @param {string} data.agencyName - The name of the agency.
   * @param {string} data.agencyType - The type of the agency.
   * @param {string} data.preparerFullName - The full name of the preparer.
   * @param {string} data.preparerTitle - The title of the preparer.
   * @param {string} data.applicantPhoneNumber - The phone number of the applicant.
   * @param {string} data.applicantEmail - The email of the applicant.
   * @param {string} data.signature - The signature of the applicant.
   * @param {boolean} [isRepresentativeOfAgencyOnBehalfOfBusinessOwner=false] - Indicates if the applicant is a representative of an agency on behalf of the business owner.
   */
  enterApplicantDetails(
    data: {
      agencyName: string;
      agencyType: string;
      preparerFullName: string;
      preparerTitle: string;
      applicantPhoneNumber: string;
      applicantEmail: string;
      signature: string;
    },
    isRepresentativeOfAgencyOnBehalfOfBusinessOwner: boolean
  ) {
    if (!isRepresentativeOfAgencyOnBehalfOfBusinessOwner) {
      this.enterData("#AgencyName", "type", data.agencyName);
      this.enterData(
        'span[data-cy="Agency Type-dropdown"]',
        "select",
        data.agencyType
      );
      this.enterData("#PreparerFullName", "type", data.preparerFullName);
      this.enterData("#PreparerTitle", "type", data.preparerTitle);
      this.enterData("#PreparerPhone", "type", data.applicantPhoneNumber);
      this.enterData("#PreparerEmailAddress", "type", data.applicantEmail);
      this.enterData("#Signature", "type", data.signature);
    } else {
      this.enterData(
        '*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]',
        "click"
      );
      this.enterData("#AgencyName", "type", data.agencyName);
      this.enterData(
        'span[data-cy="Agency Type-dropdown"]',
        "select",
        data.agencyType
      );
      this.enterData("#PreparerPhone", "type", data.applicantPhoneNumber);
      this.enterData("#PreparerEmailAddress", "type", data.applicantEmail);
      this.enterData("#Signature", "type", data.signature);
    }
  }
}

export default Form;
