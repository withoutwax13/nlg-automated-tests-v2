class BusinessAdd {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      anyList: () => cy.get("li"),
      pageTitle: () => cy.get("h2"),
      pageHelpContent: () => this.getElement().pageTitle().next(),
      businessDetailsDropdown: () => cy.get("label").contains("Business Details").next().find("input[role='combobox']"),
      addBusinessButton: () =>
        cy.get(".NLGButtonPrimary").contains("Add Business"),
      governmentSearchBox: () => cy.get(".k-combobox").find("input"),
      warningMessage: () => cy.get(".text-danger"),
      backButton: () => cy.get(".NLGButtonSecondaryFlat").contains("Back"),
      saveButton: () => cy.get("button").contains("Save"),
      cancelButton: () => cy.get("button").contains("Cancel"),
      addCustomFieldButton: () => cy.get("button").contains("Add Custom Field"),
      legalBusinessNameField: () => cy.get('input[name="BusinessName"]'),
      feinField: () => cy.get('input[name="FEIN"]'),
      legalBusinessAddress1Field: () =>
        cy.get('input[name="LegalBusiness.LegalBusinessAddress1"]'),
      legalBusinessAddress2Field: () =>
        cy.get('input[name="LegalBusiness.LegalBusinessAddress2"]'),
      legalBusinessCityField: () =>
        cy.get('input[name="LegalBusiness.LegalBusinessCity"]'),
      legalBusinessStateDropdown: () =>
        this.getElement().legalBusinessCityField().parent().next().find(".k-dropdownlist"),
      legalBusinessZipCodeField: () =>
        cy.get('input[name="LegalBusiness.LegalBusinessZipCode"]'),
      locationDbaField: () => cy.get('input[name="DBA"]'),
      locationAddress1Field: () => cy.get('input[name="BusinessAddress1"]'),
      stateTaxIdField: () => cy.get('input[name="StateTaxId"]'),
      locationOpenDateField: () =>
        cy.get("label").contains("Location Open Date").next().find("input"),
      sameBusinessLocationAddressForLegalBusinessAddressCheckbox: () =>
        cy
          .get("label")
          .contains(
            "Check this box if the business location address is the same as the legal business address."
          ),
      businessOwnerFullNameField: () =>
        cy.get('input[name="Owner.OwnerFullName"]'),
      businessOwnerEmailAddressField: () =>
        cy.get('input[name="Owner.OwnerEmailAddress"]'),
      businessOwnerPhoneNumberField: () =>
        cy.get('input[name="Owner.OwnerPhoneNumber"]'),
      businessOwnerSSNField: () => cy.get('input[name="Owner.OwnerSSN"]'),
      businessOwnerAddress1Field: () =>
        cy.get('input[name="Owner.OwnerAddress1"]'),
      businessOwnerAddress2Field: () =>
        cy.get('input[name="Owner.OwnerAddress2"]'),
      businessOwnerCityField: () => cy.get('input[name="Owner.OwnerCity"]'),
      businessOwnerStateDropdown: () =>
        this.getElement().businessOwnerCityField().parent().next().find(".k-dropdownlist"),
      businessOwnerZipCodeField: () =>
        cy.get('input[name="Owner.OwnerZipCode"]'),
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
        cy.get("h5").contains("Other Information").parent().next(),
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
    if (this.userType === "ags") {
      cy.wait(["@govBusinessConfig", "@lambdaRequestMunicipalityId", "@govBusinessConfig"]).then(
        (interceptions) => {
          interceptions.forEach((interception) => {
            expect(interception.response.statusCode).to.eq(200);
          });
        }
      );
    }
    cy.url().should("include", "/BusinessesApp/AddBusiness");
    this.getElement().legalBusinessNameField().type(data.legalBusinessName);
    this.getElement().feinField().type(data.fein);
    this.getElement()
      .legalBusinessAddress1Field()
      .type(data.legalBusinessAddress1);
    this.getElement()
      .legalBusinessAddress2Field()
      .type(data.legalBusinessAddress2);
    this.getElement().legalBusinessCityField().type(data.legalBusinessCity);
    this.getElement().legalBusinessStateDropdown().click();
    cy.get("li").contains(data.legalBusinessState).click();
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
      .click();

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
    this.getElement().businessOwnerStateDropdown().click();
    cy.get("li").contains(data.businessOwnerState).click();
    this.getElement()
      .businessOwnerZipCodeField()
      .type(data.businessOwnerZipCode);

    this.getElement()
      .sameBusinessMailingAddressAsLegalBusinessAddressCheckbox()
      .click();
    this.getElement()
      .sameBusinessManagementContactInformationAsOwnerCheckbox()
      .click();
  }

  addCustomField(customName: string, customValue: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    this.getElement().addCustomFieldButton().click();
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
    cy.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/**").as("saveBusiness");
    this.getElement().saveButton().click();
    // 400 can happen if same business identifier already exists
    cy.wait("@saveBusiness").its("response.statusCode").should("be.oneOf", [201, 400]);
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickBackButton() {
    this.getElement().backButton().click();
  }

  addBusinessOnAccount(businessDba: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Only taxpayer can proceed with this user flow.");
    }
    cy.intercept("PUT", "https://**.azavargovapps.com/businesses/taxpayerBusinesses/subscribe/**").as("subscribeBusiness");
    this.getElement().governmentSearchBox().type("Arrakis");
    this.getElement().anyList().contains("Arrakis").click();
    cy.wait("@govBusinessConfig").its("response.statusCode").should("eq", 200);
    this.getElement().businessDetailsDropdown().type(businessDba);
    this.getElement().anyList().contains(businessDba).click();
    this.getElement().pageTitle().click();
    this.getElement().addBusinessButton().click();
    cy.wait("@subscribeBusiness").its("response.statusCode").should("eq", 201);
  }
}

export default BusinessAdd;