import { currentPage, fillDateInput, listItem, typeSpecial, withText } from "../../support/runtime";

class Form {
  isRenewal: boolean;

  constructor(props: { isRenewal: boolean }) {
    this.isRenewal = props.isRenewal;
  }

  private elements() {
    const page = currentPage();

    return {
      nextButton: () => withText(page.locator(".NLGButtonPrimary"), "Next"),
      formTitle: () => page.locator("h1").first(),
      stepper: () => page.locator(".k-stepper ol"),
      backButton: () => withText(page.locator(".NLGButtonSecondary"), "Back"),
      saveAndCloseButton: () => withText(page.locator(".NLGButtonSecondary"), "Save And Close"),
      addLocationButton: () => withText(page.locator(".NLGButtonPrimary"), "Add Location"),
      removeLocationButton: () => withText(page.locator(".NLGButtonSecondary"), "Remove"),
      ownerFullName: () => page.locator("#OwnerFullName"),
      ownerPhoneNumber: () => page.locator("#OwnerPhoneNumber"),
      ownerEmailAddress: () => page.locator("#OwnerEmailAddress"),
      businessName: () => page.locator("#BusinessName"),
      fein: () => page.locator("#FEIN"),
      businessAddress1: () => page.locator("#BusinessAddress1"),
      businessAddress2: () => page.locator("#BusinessAddress2"),
      businessCity: () => page.locator("#BusinessCity"),
      businessStateDropdown: () => page.locator('span[data-cy="Legal Business State-dropdown"]'),
      businessZipCode: () => page.locator("#BusinessZipCode"),
      legalBusinessAddressCheckbox: () =>
        page.locator(
          'input[data-cy="Check this box if the Legal Business Address is the same as the Business Mailing Address-checkbox"]'
        ),
      businessOwnerInfoCheckbox: () =>
        page.locator(
          'input[data-cy="Check this box if the Business Owner Information is the same as the Business Management Contact Information-checkbox"]'
        ),
      emergencyPhoneNumber: () => page.locator("#EmergencyPhoneNumber"),
      locationOpenDate: () => page.locator('span[data-cy="Location Open Date-datePicker-input"] input'),
      locationDBA: () => page.locator('input[id^="Locations_"][id$="__BusinessName"]'),
      locationAddress1: () => page.locator('input[id^="Locations_"][id$="__BusinessAddress1"]'),
      locationAddress2: () => page.locator('input[id^="Locations_"][id$="__BusinessAddress2"]'),
      locationCity: () => page.locator('input[id^="Locations_"][id$="__BusinessCity"]'),
      locationStateDropdown: () => page.locator('span[data-cy="Location State-dropdown"]'),
      locationZipCode: () => page.locator('input[id^="Locations_"][id$="__BusinessZipCode"]'),
      locationMailingAddress1: () => page.locator('input[id^="Locations_"][id$="__MailingAddress1"]'),
      locationMailingAddress2: () => page.locator('input[id^="Locations_"][id$="__MailingAddress2"]'),
      locationMailingCity: () => page.locator('input[id^="Locations_"][id$="__MailingCity"]'),
      locationMailingStateDropdown: () => page.locator('span[data-cy="Business Mailing State-dropdown"]'),
      locationMailingZipCode: () => page.locator('input[id^="Locations_"][id$="__MailingZipCode"]'),
      managerOperatorFullName: () => page.locator('input[id^="Locations_"][id$="__OperatorFullName"]'),
      managerOperatorTitle: () => page.locator('input[name="OperatorTitleRB"]'),
      managerOperatorPhoneNumber: () => page.locator('input[name="OperatorPhoneRB"]'),
      managerOperatorEmail: () => page.locator('input[name="OperatorEmailAddressRB"]'),
      managerEmergencyPhoneNumber: () => page.locator('input[name="EmergencyPhoneNumberRB"]'),
      agencyName: () => page.locator("#AgencyName"),
      agencyTypeDropdown: () => page.locator('span[data-cy="Agency Type-dropdown"]'),
      preparerFullName: () => page.locator("#PreparerFullName"),
      preparerTitle: () => page.locator("#PreparerTitle"),
      preparerPhone: () => page.locator("#PreparerPhone"),
      preparerEmailAddress: () => page.locator("#PreparerEmailAddress"),
      signature: () => page.locator("#Signature"),
      agencyCheckbox: () =>
        page.locator(
          '*[data-cy="Check box if you are a representative of an Agency registering on behalf of a business owner.-checkbox"]'
        ),
      yesMultipleLocationsRadioButton: () =>
        page.locator(
          'input[data-cy="Yes, I will be registering multiple business locations.-radio-button"]'
        ),
      noSingleLocationRadioButton: () =>
        page.locator(
          'input[data-cy="No, I will only be registering a single business.-radio-button"]'
        ),
      applicantInfoDateData: () => page.locator("#Date"),
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
    await this.elements().removeLocationButton().last().click({ force: true });
  }

  async clickSaveAndCloseButton() {
    await this.elements().saveAndCloseButton().click({ force: true });
  }

  async clickStepInStepper(step: number) {
    await this.elements().stepper().locator("li").nth(step).click({ force: true });
  }

  async enterData(
    selector: string,
    method: "type" | "select" | "click",
    data?: string,
    selectorCountOnMultiple?: number
  ) {
    const target =
      selectorCountOnMultiple === undefined
        ? currentPage().locator(selector).first()
        : currentPage().locator(selector).nth(selectorCountOnMultiple);

    if (method === "type") {
      await target.fill("");
      if (data) {
        await target.type(data);
      }
      return;
    }

    if (method === "select") {
      if (!data) {
        throw new Error("Data is required for select.");
      }
      await target.click({ force: true });
      await listItem(data).click({ force: true });
      return;
    }

    await target.click({ force: true });
  }

  async selectIsRegisteringMultipleLocations(toRegisterMultipleLocations: boolean) {
    if (toRegisterMultipleLocations) {
      await this.elements().yesMultipleLocationsRadioButton().click({ force: true });
      return;
    }

    await this.elements().noSingleLocationRadioButton().click({ force: true });
  }

  async enterBusinessOwnerInformation(data: {
    businessOwnerFullName: string;
    businessOwnerPhoneNumber: string;
    businessOwnerEmail: string;
  }) {
    await this.elements().ownerFullName().fill(data.businessOwnerFullName);
    await this.elements().ownerPhoneNumber().fill(data.businessOwnerPhoneNumber);
    await this.elements().ownerEmailAddress().fill(data.businessOwnerEmail);
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
    await this.elements().businessName().fill(data.legalBusinessName);
    await this.elements().fein().fill(data.federalIdentificationNumber);
    await this.elements().businessAddress1().fill(data.legalBusinessAddress1);
    await this.elements().businessAddress2().fill(data.legalBusinessAddress2);
    await this.elements().businessCity().fill(data.legalBusinessCity);
    await this.elements().businessStateDropdown().click({ force: true });
    await listItem(data.legalBusinessState).click({ force: true });
    await this.elements().businessZipCode().fill(data.legalBusinessZipCode);
  }

  async checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation() {
    await this.elements().legalBusinessAddressCheckbox().check({ force: true });
    await this.elements().businessOwnerInfoCheckbox().check({ force: true });
  }

  async enterEmergencyPhoneNumbers(data: { emergencyPhoneNumber: string }) {
    await this.elements().emergencyPhoneNumber().fill(data.emergencyPhoneNumber);
  }

  async enterLocationDetails(locations: Record<string, any>[]) {
    for (const [index, location] of locations.entries()) {
      if (index > 0) {
        await this.clickAddLocationButton();
      }

      await fillDateInput(this.elements().locationOpenDate().nth(index), location.locationOpenDate);
      await this.elements().locationDBA().nth(index).fill(location.locationDBA);
      await this.elements().locationAddress1().nth(index).fill(location.locationAddress1);
      await this.elements().locationAddress2().nth(index).fill(location.locationAddress2);
      await this.elements().locationCity().nth(index).fill(location.locationCity);
      await this.elements().locationStateDropdown().nth(index).click({ force: true });
      await listItem(location.locationState).click({ force: true });
      await this.elements().locationZipCode().nth(index).fill(location.locationZip);
      await this.elements().locationMailingAddress1().nth(index).fill(location.locationMailingAddress1);
      await this.elements().locationMailingAddress2().nth(index).fill(location.locationMailingAddress2);
      await this.elements().locationMailingCity().nth(index).fill(location.locationMailingCity);
      await this.elements().locationMailingStateDropdown().nth(index).click({ force: true });
      await listItem(location.locationMailingState).click({ force: true });
      await this.elements().locationMailingZipCode().nth(index).fill(location.locationMailingZip);
      await this.elements().managerOperatorFullName().nth(index).fill(location.managerOperatorFullName);
      await this.elements().managerOperatorTitle().nth(index).fill(location.managerOperatorTitle);
      await this.elements().managerOperatorPhoneNumber().nth(index).fill(location.managerOperatorPhoneNumber);
      await this.elements().managerOperatorEmail().nth(index).fill(location.managerOperatorEmail);
      await this.elements().managerEmergencyPhoneNumber().nth(index).fill(location.emergencyPhoneNumber);
    }
  }

  async enterApplicantDetails(
    applicantInfo: {
      agencyName: string;
      agencyType: string;
      applicantPhoneNumber: string;
      applicantEmail: string;
      signature: string;
    },
    isNotAgency: boolean
  ) {
    if (!isNotAgency) {
      await this.elements().agencyCheckbox().check({ force: true });
      await this.elements().agencyName().fill(applicantInfo.agencyName);
      await this.elements().agencyTypeDropdown().click({ force: true });
      await listItem(applicantInfo.agencyType).click({ force: true });
    }

    await this.elements().preparerFullName().fill(applicantInfo.agencyName);
    await this.elements().preparerTitle().fill("Applicant");
    await this.elements().preparerPhone().fill(applicantInfo.applicantPhoneNumber);
    await this.elements().preparerEmailAddress().fill(applicantInfo.applicantEmail);
    await this.elements().signature().fill(applicantInfo.signature);
  }
}

export default Form;
