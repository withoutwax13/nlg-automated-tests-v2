import { expect, type Locator, type Page } from "@playwright/test";
import { clickByText, setMaskedDateInput, waitForLoading } from "../../support/native-helpers";

type BusinessAddProps = {
  userType: "ags" | "municipal" | "taxpayer";
};

class BusinessAdd {
  constructor(private readonly page: Page, private readonly props: BusinessAddProps) {}

  private elements() {
    return {
      anyList: () => this.page.locator("li"),
      pageTitle: () => this.page.locator("h1").first(),
      saveButton: () => this.page.locator("button").filter({ hasText: "Save" }).first(),
      cancelButton: () => this.page.locator("button").filter({ hasText: "Cancel" }).first(),
      addCustomFieldButton: () => this.page.locator("button").filter({ hasText: "Add Custom Field" }).first(),
      legalBusinessNameField: () => this.page.locator('input[name="BusinessName"]'),
      feinField: () => this.page.locator('input[name="FEIN"]'),
      legalBusinessAddress1Field: () => this.page.locator('input[name="LegalBusiness.LegalBusinessAddress1"]'),
      legalBusinessAddress2Field: () => this.page.locator('input[name="LegalBusiness.LegalBusinessAddress2"]'),
      legalBusinessCityField: () => this.page.locator('input[name="LegalBusiness.LegalBusinessCity"]'),
      legalBusinessStateDropdown: () => this.page.locator('input[name="LegalBusiness.LegalBusinessCity"]').locator("xpath=../../following-sibling::*[1]//button | ../../following-sibling::*[1]//*[contains(@class,'k-dropdownlist')]").first(),
      legalBusinessZipCodeField: () => this.page.locator('input[name="LegalBusiness.LegalBusinessZipCode"]'),
      locationDbaField: () => this.page.locator('input[name="DBA"]'),
      stateTaxIdField: () => this.page.locator('input[name="StateTaxId"]'),
      locationOpenDateField: () => this.page.locator("label").filter({ hasText: "Location Open Date" }).first().locator("xpath=following::input[1]"),
      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        this.page.locator("label").filter({ hasText: "business location address is the same as the legal business address" }).first(),
      businessOwnerFullNameField: () => this.page.locator('input[name="Owner.OwnerFullName"]'),
      businessOwnerEmailAddressField: () => this.page.locator('input[name="Owner.OwnerEmailAddress"]'),
      businessOwnerPhoneNumberField: () => this.page.locator('input[name="Owner.OwnerPhoneNumber"]'),
      businessOwnerSSNField: () => this.page.locator('input[name="Owner.OwnerSSN"]'),
      businessOwnerAddress1Field: () => this.page.locator('input[name="Owner.OwnerAddress1"]'),
      businessOwnerAddress2Field: () => this.page.locator('input[name="Owner.OwnerAddress2"]'),
      businessOwnerCityField: () => this.page.locator('input[name="Owner.OwnerCity"]'),
      businessOwnerStateDropdown: () => this.page.locator('input[name="Owner.OwnerCity"]').locator("xpath=../../following-sibling::*[1]//button | ../../following-sibling::*[1]//*[contains(@class,'k-dropdownlist')]").first(),
      businessOwnerZipCodeField: () => this.page.locator('input[name="Owner.OwnerZipCode"]'),
      sameBusinessMailingAddressAsLegalBusinessAddressCheckbox: () =>
        this.page.locator("label").filter({ hasText: "business mailing address is the same as the legal business address" }).first(),
      sameBusinessManagementContactInformationAsOwnerCheckbox: () =>
        this.page.locator("label").filter({ hasText: "business management contact information is the same as the owner information" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  private async fill(locator: Locator, value: string) {
    await locator.fill(value);
  }

  private async selectDropdown(dropdown: Locator, value: string) {
    await dropdown.click({ force: true });
    await clickByText(this.getElement().anyList(), value);
  }

  async fillFields(data: any) {
    if (this.props.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    await waitForLoading(this.page, 2);
    await this.fill(this.getElement().legalBusinessNameField(), data.legalBusinessName);
    await this.fill(this.getElement().feinField(), data.fein);
    await this.fill(this.getElement().legalBusinessAddress1Field(), data.legalBusinessAddress1);
    await this.fill(this.getElement().legalBusinessAddress2Field(), data.legalBusinessAddress2);
    await this.fill(this.getElement().legalBusinessCityField(), data.legalBusinessCity);
    await this.selectDropdown(this.getElement().legalBusinessStateDropdown(), data.legalBusinessState);
    await this.fill(this.getElement().legalBusinessZipCodeField(), data.legalBusinessZipCode);
    await this.fill(this.getElement().locationDbaField(), data.locationDba);
    await this.fill(this.getElement().stateTaxIdField(), data.stateTaxId);
    await setMaskedDateInput(this.getElement().locationOpenDateField(), data.locationOpenDate);
    await this.getElement().sameBusinessLocationAddressForLegalBusinessAddressCheckbox().click({ force: true });
    await this.fill(this.getElement().businessOwnerFullNameField(), data.businessOwnerFullName);
    await this.fill(this.getElement().businessOwnerEmailAddressField(), data.businessOwnerEmailAddress);
    await this.fill(this.getElement().businessOwnerPhoneNumberField(), data.businessOwnerPhoneNumber);
    await this.fill(this.getElement().businessOwnerSSNField(), data.businessOwnerSSN);
    await this.fill(this.getElement().businessOwnerAddress1Field(), data.businessOwnerAddress1);
    await this.fill(this.getElement().businessOwnerAddress2Field(), data.businessOwnerAddress2);
    await this.fill(this.getElement().businessOwnerCityField(), data.businessOwnerCity);
    await this.selectDropdown(this.getElement().businessOwnerStateDropdown(), data.businessOwnerState);
    await this.fill(this.getElement().businessOwnerZipCodeField(), data.businessOwnerZipCode);
    await this.getElement().sameBusinessMailingAddressAsLegalBusinessAddressCheckbox().click({ force: true });
    await this.getElement().sameBusinessManagementContactInformationAsOwnerCheckbox().click({ force: true });
  }

  async clickSaveButton() {
    const responsePromise = this.page
      .waitForResponse((response) => ["POST", "PUT"].includes(response.request().method()) && response.url().includes("/businesses/"), { timeout: 20000 })
      .catch(() => null);
    await expect(this.getElement().saveButton()).toBeEnabled();
    await this.getElement().saveButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201]).toContain(response.status());
    await waitForLoading(this.page, 5);
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click({ force: true });
  }
}

export default BusinessAdd;
