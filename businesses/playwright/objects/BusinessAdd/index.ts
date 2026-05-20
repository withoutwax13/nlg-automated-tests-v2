import type { Page, } from "@playwright/test";
import { clickByText, expectStatus, setMaskedDateInput } from "../../support/native-helpers";

class BusinessAdd {
  userType: string;
  page: Page;

  constructor(pageOrProps: Page | { userType: string }, maybeProps?: { userType: string }) {
    const hasPage = typeof (pageOrProps as Page).locator === "function";
    const props = (hasPage ? maybeProps : pageOrProps) as { userType: string };
    if (hasPage) this.page = pageOrProps as Page;
    this.userType = props.userType;
  }

  private elements() {
    return {
      anyList: () => this.page.locator("li"),

      pageTitle: () => this.page.locator("h2"),

      pageHelpContent: () => this.page.locator("h2 + *"),

      businessDetailsDropdown: () =>
        this.page.locator(
          'label:has-text("Business Details") + * input[role="combobox"]'
        ),

      addBusinessButton: () =>
        this.page.locator(".NLGButtonPrimary", { hasText: "Add Business" }),

      governmentSearchBox: () =>
        this.page.locator(".k-combobox input"),

      warningMessage: () =>
        this.page.locator(".text-danger"),

      backButton: () =>
        this.page.locator(".NLGButtonSecondaryFlat", { hasText: "Back" }),

      saveButton: () =>
        this.page.getByRole("button", { name: /^Save$/ }),

      cancelButton: () =>
        this.page.getByRole("button", { name: /^Cancel$/ }),

      addCustomFieldButton: () =>
        this.page.getByRole("button", { name: /^Add Custom Field$/ }),

      legalBusinessNameField: () =>
        this.page.locator('input[name="BusinessName"]'),

      feinField: () =>
        this.page.locator('input[name="FEIN"]'),

      legalBusinessAddress1Field: () =>
        this.page.locator('input[name="LegalBusiness.LegalBusinessAddress1"]'),

      legalBusinessAddress2Field: () =>
        this.page.locator('input[name="LegalBusiness.LegalBusinessAddress2"]'),

      legalBusinessCityField: () =>
        this.page.locator('input[name="LegalBusiness.LegalBusinessCity"]'),

      legalBusinessStateDropdown: () =>
        this.page.locator(
          '*:has(> input[name="LegalBusiness.LegalBusinessCity"]) + * .k-dropdownlist'
        ),

      legalBusinessZipCodeField: () =>
        this.page.locator('input[name="LegalBusiness.LegalBusinessZipCode"]'),

      locationDbaField: () =>
        this.page.locator('input[name="DBA"]'),

      locationAddress1Field: () =>
        this.page.locator('input[name="BusinessAddress1"]'),

      stateTaxIdField: () =>
        this.page.locator('input[name="StateTaxId"]'),

      locationOpenDateField: () =>
        this.page.locator(
          'label:has-text("Location Open Date") + * input'
        ),

      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        this.page.locator("label", {
          hasText:
            "Check this box if the business location address is the same as the legal business address.",
        }),

      businessOwnerFullNameField: () =>
        this.page.locator('input[name="Owner.OwnerFullName"]'),

      businessOwnerEmailAddressField: () =>
        this.page.locator('input[name="Owner.OwnerEmailAddress"]'),

      businessOwnerPhoneNumberField: () =>
        this.page.locator('input[name="Owner.OwnerPhoneNumber"]'),

      businessOwnerSSNField: () =>
        this.page.locator('input[name="Owner.OwnerSSN"]'),

      businessOwnerAddress1Field: () =>
        this.page.locator('input[name="Owner.OwnerAddress1"]'),

      businessOwnerAddress2Field: () =>
        this.page.locator('input[name="Owner.OwnerAddress2"]'),

      businessOwnerCityField: () =>
        this.page.locator('input[name="Owner.OwnerCity"]'),

      businessOwnerStateDropdown: () =>
        this.page.locator(
          '*:has(> input[name="Owner.OwnerCity"]) + * .k-dropdownlist'
        ),

      businessOwnerZipCodeField: () =>
        this.page.locator('input[name="Owner.OwnerZipCode"]'),

      sameBusinessMailingAddressAsLegalBusinessAddressCheckbox: () =>
        this.page.locator("label", {
          hasText:
            "Check this box if the business mailing address is the same as the legal business address.",
        }),

      sameBusinessManagementContactInformationAsOwnerCheckbox: () =>
        this.page.locator("label", {
          hasText:
            "Check this box if the business management contact information is the same as the owner information.",
        }),

      customFieldSection: () =>
        this.page.locator(
          '*:has(> h5:has-text("Other Information")) + *'
        ),

      customFieldBlocks: () =>
        this.page
          .locator('*:has(> h5:has-text("Other Information")) + *')
          .locator("div"),
    };
  }

  getElement() {
    return this.elements();
  }

  async init(page: Page) {
    this.page = page;
  }

  async fillFields(data: any, page?: Page) {
    this.page = page;
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    const govBusinessConfigResponse = this.page.waitForResponse((response) => {
      const method = response.request().method().toUpperCase();
      const url = response.url();

      return (
        method === "GET" &&
        url.includes("azavargovapps.com") &&
        url.includes("/businesses/municipalityBusinessConfig/")
      );
    });

    const lambdaRequestMunicipalityIdResponse = this.page.waitForResponse((response) => {
      const method = response.request().method().toUpperCase();
      const url = response.url();

      return (
        method === "GET" &&
        url.includes("lambda-url.us-east-1.on.aws") &&
        url.includes("municipalityId=")
      );
    });

    await this.page.waitForURL("**/BusinessesApp/AddBusiness**", {
      timeout: 120000,
    });

    await this.getElement().legalBusinessNameField().fill(data.legalBusinessName);
    await this.getElement().feinField().fill(data.fein);
    await this.getElement().legalBusinessAddress1Field().fill(data.legalBusinessAddress1);
    await this.getElement().legalBusinessAddress2Field().fill(data.legalBusinessAddress2);
    await this.getElement().legalBusinessCityField().fill(data.legalBusinessCity);

    await this.getElement().legalBusinessStateDropdown().click();
    await clickByText(this.getElement().anyList(), data.legalBusinessState);

    await this.getElement().legalBusinessZipCodeField().fill(data.legalBusinessZipCode);
    await this.getElement().locationDbaField().fill(data.locationDba);
    await this.getElement().stateTaxIdField().fill(data.stateTaxId);

    await setMaskedDateInput(
      this.getElement().locationOpenDateField(),
      data.locationOpenDate
    );

    await this.getElement()
      .sameBusinessLocationAddressForLegalBusinessAddressCheckbox()
      .click();

    await this.getElement().businessOwnerFullNameField().fill(data.businessOwnerFullName);
    await this.getElement().businessOwnerEmailAddressField().fill(data.businessOwnerEmailAddress);
    await this.getElement().businessOwnerPhoneNumberField().fill(data.businessOwnerPhoneNumber);
    await this.getElement().businessOwnerSSNField().fill(data.businessOwnerSSN);
    await this.getElement().businessOwnerAddress1Field().fill(data.businessOwnerAddress1);
    await this.getElement().businessOwnerAddress2Field().fill(data.businessOwnerAddress2);
    await this.getElement().businessOwnerCityField().fill(data.businessOwnerCity);

    await this.getElement().businessOwnerStateDropdown().click();
    await clickByText(this.getElement().anyList(), data.businessOwnerState);

    await this.getElement().businessOwnerZipCodeField().fill(data.businessOwnerZipCode);

    await this.getElement()
      .sameBusinessMailingAddressAsLegalBusinessAddressCheckbox()
      .click();

    await this.getElement()
      .sameBusinessManagementContactInformationAsOwnerCheckbox()
      .click();

    if (this.userType === "ags") {
      await expectStatus(govBusinessConfigResponse, 200);
      // await expectStatus(lambdaRequestMunicipalityIdResponse, 200);
    }
  }

  async addCustomField(customName: string, customValue: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    await this.getElement().addCustomFieldButton().click();
    const block = this.getElement().customFieldBlocks().last();
    await block.locator("input").nth(0).fill(customName);
    await block.locator("input").nth(1).fill(customValue);
  }

  async clickSaveButton(): Promise<void> {
    const putBusinessCreation = this.page.waitForResponse((response) => {
      const method = response.request().method().toUpperCase();
      const url = response.url();

      return (
        method === "PUT" &&
        url.includes("azavargovapps.com/businesses/") &&
        url.includes("municipalityBusiness")
      );
    });
    await this.getElement().saveButton().click();
    await expectStatus(putBusinessCreation, 201);
  }

  clickCancelButton(): Promise<void> {
    return this.getElement().cancelButton().click();
  }

  clickBackButton(): Promise<void> {
    return this.getElement().backButton().click();
  }

  async addBusinessOnAccount(businessDba: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Only taxpayer can proceed with this user flow.");
    }

    await this.getElement().governmentSearchBox().fill("Arrakis");
    await clickByText(this.getElement().anyList(), "Arrakis");
    await this.getElement().businessDetailsDropdown().fill(businessDba);
    await clickByText(this.getElement().anyList(), businessDba);
    await this.page.waitForTimeout(10000);
    await this.getElement().addBusinessButton().click();
    await this.page.waitForTimeout(10000);
  }
}

export default BusinessAdd;
