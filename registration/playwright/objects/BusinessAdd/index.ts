import { expect } from "@playwright/test";
import { currentPage, fillDateInput, listItem, waitForLoading, withText } from "../../support/runtime";

class BusinessAdd {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    const page = this.page();

    return {
      saveButton: () => withText(page.locator("button"), "Save"),
      legalBusinessNameField: () => page.locator('input[name="BusinessName"]'),
      feinField: () => page.locator('input[name="FEIN"]'),
      legalBusinessAddress1Field: () => page.locator('input[name="LegalBusiness.LegalBusinessAddress1"]'),
      legalBusinessAddress2Field: () => page.locator('input[name="LegalBusiness.LegalBusinessAddress2"]'),
      legalBusinessCityField: () => page.locator('input[name="LegalBusiness.LegalBusinessCity"]'),
      legalBusinessStateDropdown: () => page.locator(".k-dropdownlist").nth(0),
      legalBusinessZipCodeField: () => page.locator('input[name="LegalBusiness.LegalBusinessZipCode"]'),
      locationDbaField: () => page.locator('input[name="DBA"]'),
      stateTaxIdField: () => page.locator('input[name="StateTaxId"]'),
      locationOpenDateField: () =>
        page.locator("label").filter({ hasText: "Location Open Date" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        page.locator("label").filter({ hasText: "business location address is the same as the legal business address" }).first(),
      businessOwnerFullNameField: () => page.locator('input[name="Owner.OwnerFullName"]'),
      businessOwnerEmailAddressField: () => page.locator('input[name="Owner.OwnerEmailAddress"]'),
      businessOwnerPhoneNumberField: () => page.locator('input[name="Owner.OwnerPhoneNumber"]'),
      businessOwnerSSNField: () => page.locator('input[name="Owner.OwnerSSN"]'),
      businessOwnerAddress1Field: () => page.locator('input[name="Owner.OwnerAddress1"]'),
      businessOwnerAddress2Field: () => page.locator('input[name="Owner.OwnerAddress2"]'),
      businessOwnerCityField: () => page.locator('input[name="Owner.OwnerCity"]'),
      businessOwnerStateDropdown: () => page.locator(".k-dropdownlist").nth(1),
      businessOwnerZipCodeField: () => page.locator('input[name="Owner.OwnerZipCode"]'),
      sameBusinessMailingAddressAsLegalBusinessAddressCheckbox: () =>
        page.locator("label").filter({ hasText: "business mailing address is the same as the legal business address" }).first(),
      sameBusinessManagementContactInformationAsOwnerCheckbox: () =>
        page.locator("label").filter({ hasText: "business management contact information is the same as the owner information" }).first(),
    };
  }

  async fillFields(data: Record<string, any>) {
    await this.elements().legalBusinessNameField().fill(data.legalBusinessName);
    await this.elements().feinField().fill(data.fein);
    await this.elements().legalBusinessAddress1Field().fill(data.legalBusinessAddress1);
    await this.elements().legalBusinessAddress2Field().fill(data.legalBusinessAddress2);
    await this.elements().legalBusinessCityField().fill(data.legalBusinessCity);
    await this.elements().legalBusinessStateDropdown().click({ force: true });
    await listItem(data.legalBusinessState).click({ force: true });
    await this.elements().legalBusinessZipCodeField().fill(data.legalBusinessZipCode);
    await this.elements().locationDbaField().fill(data.locationDba);
    await this.elements().stateTaxIdField().fill(data.stateTaxId);
    await fillDateInput(this.elements().locationOpenDateField(), data.locationOpenDate);
    await this.elements().sameBusinessLocationAddressForLegalBusinessAddressCheckbox().click({ force: true });
    await this.elements().businessOwnerFullNameField().fill(data.businessOwnerFullName);
    await this.elements().businessOwnerEmailAddressField().fill(data.businessOwnerEmailAddress);
    await this.elements().businessOwnerPhoneNumberField().fill(data.businessOwnerPhoneNumber);
    await this.elements().businessOwnerSSNField().fill(data.businessOwnerSSN);
    await this.elements().businessOwnerAddress1Field().fill(data.businessOwnerAddress1);
    await this.elements().businessOwnerAddress2Field().fill(data.businessOwnerAddress2);
    await this.elements().businessOwnerCityField().fill(data.businessOwnerCity);
    await this.elements().businessOwnerStateDropdown().click({ force: true });
    await listItem(data.businessOwnerState).click({ force: true });
    await this.elements().businessOwnerZipCodeField().fill(data.businessOwnerZipCode);
    await this.elements().sameBusinessMailingAddressAsLegalBusinessAddressCheckbox().click({ force: true });
    await this.elements().sameBusinessManagementContactInformationAsOwnerCheckbox().click({ force: true });
  }

  async clickSaveButton() {
    const saveBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/")
    );
    await this.elements().saveButton().click({ force: true });
    expect([201, 400]).toContain((await saveBusiness).status());
    await waitForLoading();
  }
}

export default BusinessAdd;
