import { type Locator, type Page, type Response } from "@playwright/test";
import { setMaskedDateInput, waitForLoading } from "../../support/native-helpers";
import DatePicker from "../DatePicker";

type FormProps = { isRenewal: boolean };
type EntryMethod = "type" | "select" | "click";

class Form {
  isRenewal: boolean;

  constructor(protected readonly page: Page, props: FormProps) {
    this.isRenewal = props.isRenewal;
  }

  private elements() {
    return {
      nextButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first(),
      formTitle: () => this.page.locator("h1"),
      stepper: () => this.page.locator(".k-stepper ol"),
      backButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Back" }).first(),
      saveAndCloseButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Save And Close" }).first(),
      addLocationButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Add Location" }).first(),
      removeLocationButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Remove" }).first(),
      ownerFullName: () => this.page.locator("#OwnerFullName"),
      ownerPhoneNumber: () => this.page.locator("#OwnerPhoneNumber"),
      ownerEmailAddress: () => this.page.locator("#OwnerEmailAddress"),
      businessName: () => this.page.locator("#BusinessName"),
      fein: () => this.page.locator("#FEIN"),
      businessAddress1: () => this.page.locator("#BusinessAddress1"),
      businessAddress2: () => this.page.locator("#BusinessAddress2"),
      businessCity: () => this.page.locator("#BusinessCity"),
      businessStateDropdown: () => this.page.locator('span[data-cy="Legal Business State-dropdown"]'),
      businessZipCode: () => this.page.locator("#BusinessZipCode"),
      noRadioButton: () => this.page.locator('input[data-cy="No-radio-button"]'),
      legalBusinessAddressCheckbox: () => this.page.locator('input[data-cy="Check this box if the Legal Business Address is the same as the Business Mailing Address-checkbox"]'),
      businessOwnerInfoCheckbox: () => this.page.locator('input[data-cy="Check this box if the Business Owner Information is the same as the Business Management Contact Information-checkbox"]'),
      emergencyPhoneNumber: () => this.page.locator("#EmergencyPhoneNumber"),
      locationOpenDate: () => this.page.locator('span[data-cy="Location Open Date-datePicker-input"] input'),
      locationDBA: () => this.page.locator('span[data-cy="Location Trade Name DBA-masked-input"]'),
      locationAddress1: () => this.page.locator('span[data-cy="Location Address 1-masked-input"]'),
      locationAddress2: () => this.page.locator('span[data-cy="Location Address 2-masked-input"]'),
      locationCity: () => this.page.locator('span[data-cy="Location City-masked-input"]'),
      locationStateDropdown: () => this.page.locator('span[data-cy="Location State-dropdown"]'),
      locationZipCode: () => this.page.locator('span[data-cy="Location Zip Code-masked-input"]'),
      locationMailingAddress1: () => this.page.locator('span[data-cy="Business Mailing Address 1-masked-input"]'),
      locationMailingAddress2: () => this.page.locator('span[data-cy="Business Mailing Address 2-masked-input"]'),
      locationMailingCity: () => this.page.locator('span[data-cy="Business Mailing City-masked-input"]'),
      locationMailingStateDropdown: () => this.page.locator('span[data-cy="Business Mailing State-dropdown"]'),
      locationMailingZipCode: () => this.page.locator('span[data-cy="Business Mailing Zip Code-masked-input"]'),
      managerOperatorFullName: () => this.page.locator('span[data-cy="Manager/Operator Full Name-masked-input"]'),
      managerOperatorTitle: () => this.page.locator('input[name="OperatorTitleRB"]'),
      managerOperatorPhoneNumber: () => this.page.locator('input[name="OperatorPhoneRB"]'),
      managerOperatorEmail: () => this.page.locator('input[name="OperatorEmailAddressRB"]'),
      managerEmergencyPhoneNumber: () => this.page.locator('input[name="EmergencyPhoneNumberRB"]'),
      agencyName: () => this.page.locator("#AgencyName"),
      agencyTypeDropdown: () => this.page.locator('span[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => this.page.locator("#PreparerFullName"),
      preparerTitle: () => this.page.locator("#PreparerTitle"),
      preparerPhone: () => this.page.locator("#PreparerPhone"),
      preparerEmailAddress: () => this.page.locator("#PreparerEmailAddress"),
      signature: () => this.page.locator("#Signature"),
      agencyCheckbox: () => this.page.locator('*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]'),
      yesMultipleLocationsRadioButton: () => this.page.locator('input[data-cy="Yes, I will be registering multiple business locations.-radio-button"]'),
      noSingleLocationRadioButton: () => this.page.locator('input[data-cy="No, I will only be registering a single business.-radio-button"]'),
      applicantInfoDateData: () => this.page.locator("#Date"),
      anyList: () => this.page.locator("li"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickNextbutton() {
    await this.elements().nextButton().click({ force: true });
  }

  async clickBackButton() {
    await this.elements().backButton().click({ force: true });
  }

  async clickAddLocationButton() {
    await this.elements().addLocationButton().click({ force: true });
  }

  async clickRemoveLocationButton() {
    await this.elements().removeLocationButton().click({ force: true });
  }

  async clickSaveAndCloseButton() {
    await this.elements().saveAndCloseButton().click({ force: true });
  }

  async clickStepInStepper(step: number) {
    await this.elements().stepper().locator("li").nth(step).click({ force: true });
  }

  async addLocation() {
    await this.elements().addLocationButton().click({ force: true });
  }

  private waitForFormPatch() {
    return this.page
      .waitForResponse(
        (response: Response) =>
          response.request().method() === "PATCH" &&
          response.url().includes("/filings/") &&
          response.url().includes("/input?form-id="),
        { timeout: 10000 }
      )
      .catch(() => null);
  }

  private async fillTarget(locator: Locator, data: string) {
    const input = locator.locator("input").first();
    if (await input.count()) {
      await input.scrollIntoViewIfNeeded();
      await input.fill(data);
      return;
    }
    await locator.fill(data);
  }

  async enterData(
    selector: string,
    method: EntryMethod,
    data?: any,
    selectorCountOnMultiple?: number,
    isWaitForIntercept = true
  ) {
    if (method === "select" && (data === undefined || data === "")) {
      throw new Error(`Data is required for ${method} method`);
    }

    const patchPromise = isWaitForIntercept ? this.waitForFormPatch() : Promise.resolve(null);
    const matched = this.page.locator(selector);
    const element = selectorCountOnMultiple === undefined ? matched.first() : matched.nth(selectorCountOnMultiple);

    switch (method) {
      case "type":
        if (data !== undefined && data !== null) await this.fillTarget(element, String(data));
        break;
      case "select":
        await element.click();

        const option = this.page
          .getByRole("option", { name: String(data), exact: true });

        await option.click();
        break;
      case "click":
        await element.scrollIntoViewIfNeeded();
        await element.click({ force: true });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    await patchPromise;
    await this.page.waitForTimeout(500);
  }

  async selectIsRegisteringMultipleLocations(toRegisterMultipleLocations: boolean) {
    if (toRegisterMultipleLocations) {
      await this.enterData('input[data-cy="Yes, I will be registering multiple business locations.-radio-button"]', "click");
      return;
    }
    await this.enterData('input[data-cy="No, I will only be registering a single business.-radio-button"]', "click");
  }

  async enterBusinessOwnerInformation(data: {
    businessOwnerFullName: string;
    businessOwnerPhoneNumber: string;
    businessOwnerEmail: string;
  }) {
    await this.enterData("#OwnerFullName", "type", data.businessOwnerFullName);
    await this.enterData("#OwnerPhoneNumber", "type", data.businessOwnerPhoneNumber);
    await this.enterData("#OwnerEmailAddress", "type", data.businessOwnerEmail);
  }

  async enterLegalBusinessInformation(data: {
    legalBusinessName: string;
    legalBusinessAddress1: string;
    legalBusinessAddress2: string;
    legalBusinessCity: string;
    legalBusinessState: string;
    legalBusinessZipCode: string;
    federalIdentificationNumber: string;
  }) {
    await this.enterData("#BusinessName", "type", data.legalBusinessName);
    await this.enterData("#FEIN", "type", data.federalIdentificationNumber);
    await this.enterData("#BusinessAddress1", "type", data.legalBusinessAddress1);
    await this.enterData("#BusinessAddress2", "type", data.legalBusinessAddress2);
    await this.enterData("#BusinessCity", "type", data.legalBusinessCity);
    await this.enterData('span[data-cy="Legal Business State-dropdown"] #BusinessState', "select", data.legalBusinessState);
    await this.enterData("#BusinessZipCode", "type", data.legalBusinessZipCode);
  }

  async checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation() {
    await this.enterData('input[data-cy="Check this box if the Legal Business Address is the same as the Business Mailing Address-checkbox"]', "click");
    await this.enterData('input[data-cy="No-radio-button"]', "click");
    await this.enterData('input[data-cy="Check this box if the Business Owner Information is the same as the Business Management Contact Information-checkbox"]', "click");
  }

  async enterEmergencyPhoneNumbers(data: { emergencyPhoneNumber: string }) {
    await this.enterData("#EmergencyPhoneNumber", "type", data.emergencyPhoneNumber);
  }

  private async enterLocationDate(date: { month: number; day: number; year: number }, index: number) {
    const datePicker = new DatePicker(this.page);
    await this.page.locator('[title="Toggle calendar"]').click({ force: true });
    datePicker.selectDate(date.month, date.day, date.year);
    await this.waitForFormPatch();
  }

  async enterLocationDetails(data: {
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
  }[]) {
    for (let index = 0; index < data.length; index += 1) {
      const location = data[index];
      const enter = (selector: string, method: EntryMethod, value: any) =>
        this.enterData(selector, method, value, data.length > 1 ? index : undefined);

      await this.enterLocationDate(location.locationOpenDate, data.length > 1 ? index : 0);
      await enter('span[data-cy="Location Trade Name DBA-masked-input"]', "type", location.locationDBA);
      await enter('span[data-cy="Location Address 1-masked-input"]', "type", location.locationAddress1);
      await enter('span[data-cy="Location Address 2-masked-input"]', "type", location.locationAddress2);
      await enter('span[data-cy="Location City-masked-input"]', "type", location.locationCity);
      await enter('span[data-cy="Location State-dropdown"] button', "select", location.locationState);
      await enter('span[data-cy="Location Zip Code-masked-input"]', "type", location.locationZip);

      if (data.length > 1) {
        await enter('span[data-cy="Business Mailing Address 1-masked-input"]', "type", location.locationMailingAddress1);
        await enter('span[data-cy="Business Mailing Address 2-masked-input"]', "type", location.locationMailingAddress2);
        await enter('span[data-cy="Business Mailing City-masked-input"]', "type", location.locationMailingCity);
        await enter('span[data-cy="Business Mailing State-dropdown"] button', "select", location.locationMailingState);
        await enter('span[data-cy="Business Mailing Zip Code-masked-input"]', "type", location.locationMailingZip);
        await enter('span[data-cy="Manager/Operator Full Name-masked-input"]', "type", location.managerOperatorFullName);
        await enter('input[name="OperatorTitleRB"]', "type", location.managerOperatorTitle);
        await enter('input[name="OperatorPhoneRB"]', "type", location.managerOperatorPhoneNumber);
        await enter('input[name="OperatorEmailAddressRB"]', "type", location.managerOperatorEmail);
        await enter('input[name="EmergencyPhoneNumberRB"]', "type", location.emergencyPhoneNumber);
      }

      if (index < data.length - 1) await this.addLocation();
      await waitForLoading(this.page);
    }
  }

  async enterApplicantDetails(
    data: {
      agencyName: string;
      agencyType: string;
      preparerFullName?: string;
      preparerTitle?: string;
      applicantPhoneNumber: string;
      applicantEmail: string;
      signature: string;
    },
    isRepresentativeOfAgencyOnBehalfOfBusinessOwner: boolean
  ) {
    if (!isRepresentativeOfAgencyOnBehalfOfBusinessOwner) {
      await this.enterData("#AgencyName", "type", data.agencyName);
      await this.enterData('span[data-cy="Agency Type-dropdown"] button', "select", data.agencyType);
      await this.enterData("#PreparerFullName", "type", data.preparerFullName ?? data.agencyName);
      await this.enterData("#PreparerTitle", "type", data.preparerTitle ?? data.agencyType);
      await this.enterData("#PreparerPhone", "type", data.applicantPhoneNumber);
      await this.enterData("#PreparerEmailAddress", "type", data.applicantEmail);
      await this.enterData("#Signature", "type", data.signature);
      return;
    }

    await this.enterData('*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]', "click");
    await this.enterData("#AgencyName", "type", data.agencyName);
    await this.enterData('span[data-cy="Agency Type-dropdown"] button', "select", data.agencyType);
    await this.enterData("#PreparerPhone", "type", data.applicantPhoneNumber);
    await this.enterData("#PreparerEmailAddress", "type", data.applicantEmail);
    await this.enterData("#Signature", "type", data.signature);
  }
}

export default Form;
