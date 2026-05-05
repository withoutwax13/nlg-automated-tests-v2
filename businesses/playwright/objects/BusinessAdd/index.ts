import { expect, type Locator } from "@playwright/test";
import { buttonByText, currentPage, expectPathname, fillDateInput, listItem, waitForLoading } from "../../support/runtime";

class BusinessAdd {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  private checkboxLabel(text: string): Locator {
    return this.page().locator("label").filter({ hasText: text }).first();
  }

  private elements() {
    return {
      anyList: () => this.page().locator("li"),
      pageTitle: () => this.page().locator("h2").first(),
      businessDetailsDropdown: () =>
        this.page()
          .locator("label")
          .filter({ hasText: "Business Details" })
          .first()
          .locator("xpath=following-sibling::*[1]")
          .locator("input[role='combobox']"),
      addBusinessButton: () => buttonByText("Add Business"),
      governmentSearchBox: () => this.page().locator(".k-combobox input").first(),
      warningMessage: () => this.page().locator(".text-danger"),
      backButton: () => this.page().locator(".NLGButtonSecondaryFlat").filter({ hasText: "Back" }).first(),
      saveButton: () => buttonByText("Save"),
      cancelButton: () => buttonByText("Cancel"),
      addCustomFieldButton: () => buttonByText("Add Custom Field"),
      legalBusinessNameField: () => this.page().locator('input[name="BusinessName"]'),
      feinField: () => this.page().locator('input[name="FEIN"]'),
      legalBusinessAddress1Field: () => this.page().locator('input[name="LegalBusiness.LegalBusinessAddress1"]'),
      legalBusinessAddress2Field: () => this.page().locator('input[name="LegalBusiness.LegalBusinessAddress2"]'),
      legalBusinessCityField: () => this.page().locator('input[name="LegalBusiness.LegalBusinessCity"]'),
      legalBusinessStateDropdown: () =>
        this.page()
          .locator('input[name="LegalBusiness.LegalBusinessCity"]')
          .locator("xpath=ancestor::*[contains(@class,'k-form-field') or contains(@class,'col')]")
          .locator("xpath=following-sibling::*[1]")
          .locator(".k-dropdownlist")
          .first(),
      legalBusinessZipCodeField: () => this.page().locator('input[name="LegalBusiness.LegalBusinessZipCode"]'),
      locationDbaField: () => this.page().locator('input[name="DBA"]'),
      locationAddress1Field: () => this.page().locator('input[name="BusinessAddress1"]'),
      stateTaxIdField: () => this.page().locator('input[name="StateTaxId"]'),
      locationOpenDateField: () =>
        this.page()
          .locator("label")
          .filter({ hasText: "Location Open Date" })
          .first()
          .locator("xpath=following-sibling::*[1]")
          .locator("input")
          .first(),
      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        this.checkboxLabel(
          "Check this box if the business location address is the same as the legal business address.",
        ),
      businessOwnerFullNameField: () => this.page().locator('input[name="Owner.OwnerFullName"]'),
      businessOwnerEmailAddressField: () => this.page().locator('input[name="Owner.OwnerEmailAddress"]'),
      businessOwnerPhoneNumberField: () => this.page().locator('input[name="Owner.OwnerPhoneNumber"]'),
      businessOwnerSSNField: () => this.page().locator('input[name="Owner.OwnerSSN"]'),
      businessOwnerAddress1Field: () => this.page().locator('input[name="Owner.OwnerAddress1"]'),
      businessOwnerAddress2Field: () => this.page().locator('input[name="Owner.OwnerAddress2"]'),
      businessOwnerCityField: () => this.page().locator('input[name="Owner.OwnerCity"]'),
      businessOwnerStateDropdown: () =>
        this.page()
          .locator('input[name="Owner.OwnerCity"]')
          .locator("xpath=ancestor::*[contains(@class,'k-form-field') or contains(@class,'col')]")
          .locator("xpath=following-sibling::*[1]")
          .locator(".k-dropdownlist")
          .first(),
      businessOwnerZipCodeField: () => this.page().locator('input[name="Owner.OwnerZipCode"]'),
      sameBusinessMailingAddressAsLegalBusinessAddressCheckbox: () =>
        this.checkboxLabel(
          "Check this box if the business mailing address is the same as the legal business address.",
        ),
      sameBusinessManagementContactInformationAsOwnerCheckbox: () =>
        this.checkboxLabel(
          "Check this box if the business management contact information is the same as the owner information.",
        ),
      customFieldSection: () =>
        this.page().locator("h5").filter({ hasText: "Other Information" }).first().locator("xpath=..").locator("xpath=following-sibling::*[1]"),
      customFieldBlocks: () => this.page().locator(".NLG-GridSettings div"),
    };
  }

  getElement() {
    return this.elements();
  }

  async fillFields(data: Record<string, any>) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    await expectPathname(/\/BusinessesApp\/AddBusiness/);
    await this.getElement().legalBusinessNameField().fill(data.legalBusinessName);
    await this.getElement().feinField().fill(data.fein);
    await this.getElement().legalBusinessAddress1Field().fill(data.legalBusinessAddress1);
    await this.getElement().legalBusinessAddress2Field().fill(data.legalBusinessAddress2);
    await this.getElement().legalBusinessCityField().fill(data.legalBusinessCity);
    await this.getElement().legalBusinessStateDropdown().click();
    await listItem(data.legalBusinessState).click();
    await this.getElement().legalBusinessZipCodeField().fill(data.legalBusinessZipCode);
    await this.getElement().locationDbaField().fill(data.locationDba);
    await this.getElement().stateTaxIdField().fill(data.stateTaxId);
    await fillDateInput(this.getElement().locationOpenDateField(), data.locationOpenDate);
    await this.getElement().sameBusinessLocationAddressForLegalBusinessAddressCheckbox().click();
    await this.getElement().businessOwnerFullNameField().fill(data.businessOwnerFullName);
    await this.getElement().businessOwnerEmailAddressField().fill(data.businessOwnerEmailAddress);
    await this.getElement().businessOwnerPhoneNumberField().fill(data.businessOwnerPhoneNumber);
    await this.getElement().businessOwnerSSNField().fill(data.businessOwnerSSN);
    await this.getElement().businessOwnerAddress1Field().fill(data.businessOwnerAddress1);
    await this.getElement().businessOwnerAddress2Field().fill(data.businessOwnerAddress2);
    await this.getElement().businessOwnerCityField().fill(data.businessOwnerCity);
    await this.getElement().businessOwnerStateDropdown().click();
    await listItem(data.businessOwnerState).click();
    await this.getElement().businessOwnerZipCodeField().fill(data.businessOwnerZipCode);
    await this.getElement().sameBusinessMailingAddressAsLegalBusinessAddressCheckbox().click();
    await this.getElement().sameBusinessManagementContactInformationAsOwnerCheckbox().click();
  }

  async addCustomField(customName: string, customValue: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    await this.getElement().addCustomFieldButton().click();
    const block = this.page().locator("input").filter({ has: this.page().locator("input") }).nth(-1);
    await block.fill(customName);
    await this.page().locator("input").nth(-1).fill(customValue);
  }

  async clickSaveButton() {
    const saveBusiness = this.page().waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/businesses/municipalityBusiness/"),
    );

    await this.getElement().saveButton().click();
    const response = await saveBusiness;
    expect([201, 400]).toContain(response.status());
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickBackButton() {
    await this.getElement().backButton().click();
  }

  async addBusinessOnAccount(businessDba: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Only taxpayer can proceed with this user flow.");
    }

    const subscribeBusiness = this.page().waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/businesses/taxpayerBusinesses/subscribe/"),
    );

    await this.getElement().governmentSearchBox().fill("Arrakis");
    await listItem("Arrakis").click();
    await waitForLoading();
    await this.getElement().businessDetailsDropdown().fill(businessDba);
    await listItem(businessDba).click();
    await this.getElement().pageTitle().click();
    await this.getElement().addBusinessButton().click();
    expect((await subscribeBusiness).status()).toBe(201);
  }
}

export default BusinessAdd;
