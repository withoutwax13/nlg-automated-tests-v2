class BusinessAdd {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      anyList: () => pw.get("li"),
      pageTitle: () => pw.get("h1"),
      pageHelpContent: () => this.getElement().pageTitle().next(),
      businessDetailsDropdown: () => pw.get(".BusinessDetailsComboBox"),
      addBusinessButton: () =>
        pw.get(".NLGButtonPrimary").contains("Add Business"),
      governmentSearchBox: () => pw.get(".k-combobox").find("input"),
      warningMessage: () => pw.get(".text-danger"),
      backButton: () => pw.get(".NLGButtonSecondaryFlat").contains("Back"),
      saveButton: () => pw.get("button").contains("Save"),
      cancelButton: () => pw.get("button").contains("Cancel"),
      addCustomFieldButton: () => pw.get("button").contains("Add Custom Field"),
      legalBusinessNameField: () => pw.get('input[name="BusinessName"]'),
      feinField: () => pw.get('input[name="FEIN"]'),
      legalBusinessAddress1Field: () =>
        pw.get('input[name="LegalBusiness.LegalBusinessAddress1"]'),
      legalBusinessAddress2Field: () =>
        pw.get('input[name="LegalBusiness.LegalBusinessAddress2"]'),
      legalBusinessCityField: () =>
        pw.get('input[name="LegalBusiness.LegalBusinessCity"]'),
      legalBusinessStateDropdown: () =>
        this.getElement().legalBusinessCityField().parent().next().find(".k-dropdownlist"),
      legalBusinessZipCodeField: () =>
        pw.get('input[name="LegalBusiness.LegalBusinessZipCode"]'),
      locationDbaField: () => pw.get('input[name="DBA"]'),
      stateTaxIdField: () => pw.get('input[name="StateTaxId"]'),
      locationOpenDateField: () =>
        pw.get("label").contains("Location Open Date").next().find("input"),
      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        cy
          .get("label")
          .contains(
            "Check this box if the business location address is the same as the legal business address."
          ),
      businessOwnerFullNameField: () =>
        pw.get('input[name="Owner.OwnerFullName"]'),
      businessOwnerEmailAddressField: () =>
        pw.get('input[name="Owner.OwnerEmailAddress"]'),
      businessOwnerPhoneNumberField: () =>
        pw.get('input[name="Owner.OwnerPhoneNumber"]'),
      businessOwnerSSNField: () => pw.get('input[name="Owner.OwnerSSN"]'),
      businessOwnerAddress1Field: () =>
        pw.get('input[name="Owner.OwnerAddress1"]'),
      businessOwnerAddress2Field: () =>
        pw.get('input[name="Owner.OwnerAddress2"]'),
      businessOwnerCityField: () => pw.get('input[name="Owner.OwnerCity"]'),
      businessOwnerStateDropdown: () =>
        this.getElement().businessOwnerCityField().parent().next().find(".k-dropdownlist"),
      businessOwnerZipCodeField: () =>
        pw.get('input[name="Owner.OwnerZipCode"]'),
      sameBusinessMailingAddressAsLegalBusinessAddressCheckbox: () =>
        cy
          .get("label")
          .contains(
            "Check this box if the business mailing address is the same as the legal business address."
          ),
      sameBusinessManagementContactInformationAsOwnerCheckbox: () =>
        cy
          .get("label")
          .contains(
            "Check this box if the business management contact information is the same as the owner information."
          ),
      customFieldSection: () =>
        pw.get("h5").contains("Other Information").parent().next(),
      customFieldBlocks: () =>
        this.getElement().customFieldSection().find("div"),
    };
  }

  getElement() {
    return this.elements();
  }

  fillFields(data: any) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    pw.wait(["@govBusinessConfig", "@lambdaRequestMunicipalityId", "@govBusinessConfig"]).then(
      (interceptions) => {
        interceptions.forEach((interception) => {
          expect(interception.response.statusCode).to.eq(200);
        });
      }
    );
    this.getElement().legalBusinessNameField().type(data.legalBusinessName);
    this.getElement().feinField().type(data.fein);
    this.getElement()
      .legalBusinessAddress1Field()
      .type(data.legalBusinessAddress1);
    this.getElement()
      .legalBusinessAddress2Field()
      .type(data.legalBusinessAddress2);
    this.getElement().legalBusinessCityField().type(data.legalBusinessCity);
    this.getElement().legalBusinessStateDropdown().click( {force: true} );
    pw.get("li").contains(data.legalBusinessState).click( {force: true} );
    this.getElement()
      .legalBusinessZipCodeField()
      .type(data.legalBusinessZipCode);

    this.getElement().locationDbaField().type(data.locationDba);
    this.getElement().stateTaxIdField().type(data.stateTaxId);
    this.getElement()
      .locationOpenDateField()
      .type(`${data.locationOpenDate.month}`);
    this.getElement()
      .locationOpenDateField()
      .type(`{rightArrow}${data.locationOpenDate.day}`);
    this.getElement()
      .locationOpenDateField()
      .type(`{rightArrow}{rightArrow}${data.locationOpenDate.year}`);
    this.getElement()
      .sameBusinessLocationAddressForLegalBusinessAddressCheckbox()
      .click( {force: true} );

    this.getElement()
      .businessOwnerFullNameField()
      .type(data.businessOwnerFullName);
    this.getElement()
      .businessOwnerEmailAddressField()
      .type(data.businessOwnerEmailAddress);
    this.getElement()
      .businessOwnerPhoneNumberField()
      .type(data.businessOwnerPhoneNumber);
    this.getElement().businessOwnerSSNField().type(data.businessOwnerSSN);
    this.getElement()
      .businessOwnerAddress1Field()
      .type(data.businessOwnerAddress1);
    this.getElement()
      .businessOwnerAddress2Field()
      .type(data.businessOwnerAddress2);
    this.getElement().businessOwnerCityField().type(data.businessOwnerCity);
    this.getElement().businessOwnerStateDropdown().click( {force: true} );
    pw.get("li").contains(data.businessOwnerState).click( {force: true} );
    this.getElement()
      .businessOwnerZipCodeField()
      .type(data.businessOwnerZipCode);

    this.getElement()
      .sameBusinessMailingAddressAsLegalBusinessAddressCheckbox()
      .click( {force: true} );
    this.getElement()
      .sameBusinessManagementContactInformationAsOwnerCheckbox()
      .click( {force: true} );
  }

  addCustomField(customName: string, customValue: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    this.getElement().addCustomFieldButton().click( {force: true} );
    this.getElement()
      .customFieldBlocks()
      .last()
      .find("input")
      .eq(0)
      .type(customName);
    this.getElement()
      .customFieldBlocks()
      .last()
      .find("input")
      .eq(1)
      .type(customValue);
  }

  clickSaveButton() {
    this.getElement().saveButton().click( {force: true} );
    pw.waitForLoading();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click( {force: true} );
  }

  clickBackButton() {
    this.getElement().backButton().click( {force: true} );
  }

  addBusinessOnAccount(businessDba: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Only taxpayer can proceed with this user flow.");
    }
    this.getElement().governmentSearchBox().type("Arrakis");
    this.getElement().anyList().contains("Arrakis").click( {force: true} );
    pw.waitForLoading();
    this.getElement().businessDetailsDropdown().type(businessDba);
    this.getElement().anyList().contains(businessDba).click( {force: true} );
    this.getElement().addBusinessButton().click( {force: true} );
    pw.waitForLoading();
  }
}

export default BusinessAdd;