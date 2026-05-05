class RegistrationRecord {
  constructor() {}
  private elements() {
    return {
      pageTitle: () => cy.get("h1"),
      addressData: () => this.getElements().pageTitle().next(),
      registrationStatusCard: () =>
        cy
          .get("main")
          .find("div")
          .find("section")
          .first()
          .find("div")
          .find("h3")
          .contains("Registration Status")
          .parent(),
      activeRegistrationCard: () =>
        cy
          .get("main")
          .find("div")
          .find("section")
          .first()
          .find("div")
          .find("h3")
          .contains("Active Registration")
          .parent(),
      associatedRecordsCard: () =>
        cy
          .get("main")
          .find("div")
          .find("section")
          .first()
          .find("div")
          .find("h3")
          .contains("Associated Records")
          .parent(),
      registrationDetailsCard: () =>
        cy
          .get("main")
          .find("div")
          .find("section")
          .eq(1)
          .find("div")
          .find("div")
          .find("h3")
          .contains("Registration Details"),
      applicationCard: () =>
        cy
          .get("main")
          .find("div")
          .find("section")
          .eq(1)
          .find("div")
          .find("div")
          .find("h3")
          .contains("Applications"),
      registrationStatusData: () =>
        this.getElements()
          .registrationStatusCard()
          .find("div")
          .find("span")
          .contains("Registration Status")
          .next(),
      formNameData: () =>
        this.getElements()
          .registrationStatusCard()
          .find("div")
          .find("span")
          .contains("Form Name")
          .next(),
      formRequirementStatusData: () =>
        this.getElements()
          .registrationStatusCard()
          .find("div")
          .find("span")
          .contains("Form Requirement Status")
          .next(),
      renewalAvailabilityData: () =>
        this.getElements()
          .registrationStatusCard()
          .find("div")
          .find("span")
          .contains("Renewal Availability")
          .next(),
      registrationStartDateData: () =>
        this.getElements()
          .activeRegistrationCard()
          .find("div")
          .find("span")
          .contains("Registration Start Date")
          .next(),
      registrationTypeData: () =>
        this.getElements()
          .activeRegistrationCard()
          .find("div")
          .find("span")
          .contains("Registration Type")
          .next(),
      downloadCertificateButton: () =>
        this.getElements()
          .activeRegistrationCard()
          .find("div")
          .find("span")
          .contains("Download Certificate")
          .should(($el) => {
            if ($el.length > 0) {
              return $el.parent();
            } else return $el;
          }),
      downloadApplicationButton: () =>
        this.getElements()
          .activeRegistrationCard()
          .find("div")
          .find("span")
          .contains("Download Application")
          .should(($el) => {
            if ($el.length > 0) {
              return $el.parent();
            } else return $el;
          }),
      businessRecordLink: () =>
        this.getElements()
          .associatedRecordsCard()
          .find("h3")
          .next()
          .find("span")
          .contains("Business Record")
          .next(),
      applicantContactData: () =>
        this.getElements()
          .associatedRecordsCard()
          .find("h3")
          .next()
          .next()
          .find("div"),
      registrationDetailsData: (fieldLabel: string) =>
        this.getElements()
          .registrationDetailsCard()
          .find("div")
          .find("section")
          .find("span")
          .contains(fieldLabel)
          .next(),
      applicationsList: () =>
        this.getElements().applicationCard().find("table"),
      locationsList: () => this.getElements().applicationCard().find("table"),
      locationLink: (locationDba: string) =>
        this.getElements()
          .locationsList()
          .find("tbody")
          .find("tr")
          .find("td")
          .contains(locationDba),
      switchToApplicationsTab: () =>
        this.getElements()
          .applicationCard()
          .find("ul")
          .find("li")
          .eq(0)
          .find("a"),
      switchToLocationsTab: () =>
        this.getElements()
          .applicationCard()
          .find("ul")
          .find("li")
          .eq(1)
          .find("a"),
      viewAllApplicationsButton: () =>
        cy.get("NLGButtonSecondaryFlat").contains("View All"),
      backToRegistrationGridButton: () =>
        cy.get("NLGButtonSecondaryFlat").contains("Registrations"),
    };
  }
  getElements() {
    return this.elements();
  }
  clickBackToRegistrationListButton() {
    this.getElements().backToRegistrationGridButton().click( {force: true} );
  }
  clickDownloadCertificateButton() {
    this.getElements().downloadCertificateButton().click( {force: true} );
  }
  clickDownloadApplicationButton() {
    this.getElements().downloadApplicationButton().click( {force: true} );
  }
  clickBusinessRecordLink() {
    this.getElements().businessRecodLink().click( {force: true} );
  }
  getRegistrationDetails(label: string) {
    return this.getElements().registrationDetailsData(label);
  }
  switchToApplicationsTab() {
    this.getElements().switchToApplicationsTab().click( {force: true} );
  }
  switchToLocationsTab() {
    this.getElements().switchToLocationsTab().click( {force: true} );
  }
  clickLocationLink(locationDBA: string) {
    this.getElements().locationLink(locationDBA).click( {force: true} );
  }
  clickViewAllApplications() {
    this.getElements().viewAllApplicationsButton().click( {force: true} );
  }
}

export default RegistrationRecord;
