class InviteUserModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      title: () => this.getElement().modal().find(".k-dialog-title"),
      closeModalButton: () =>
        this.getElement().modal().find('button[aria-label="Close"]'),
      modalContent: () => this.getElement().modal().find(".k-dialog-content"),
      cancelButton: () =>
        this.getElement().modal().find("button").contains("Cancel"),
      inviteButton: () =>
        this.getElement().modal().find("button").contains("Invite"),
      userTypeRadioButton: (userGroup: string) =>
        this.getElement().modal().find(".k-radio-item").contains(userGroup),
      emailInput: () => this.getElement().modal().find("input[id='Email']"),
      subscriptionTypeDropdown: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Select subscription type")
          .parent()
          .next()
          .find(".k-dropdownlist"),
      municipalityDropdown: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Select Municipality")
          .parent()
          .next()
          .find(".k-dropdownlist"),
    };
  }

  getElement() {
    return this.elements();
  }

  selectSubscriptionType(subscriptionType: string) {
    this.getElement().subscriptionTypeDropdown().click();
    pw.get(".k-list-item").contains(subscriptionType).click();
  }

  selectMunicipality(municipality: string) {
    this.getElement().municipalityDropdown().click();
    pw.get(".k-list-item").contains(municipality).click();
  }

  clickCloseModalButton() {
    this.getElement().closeModalButton().click();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickInviteButton() {
    this.getElement().inviteButton().click();
  }

  checkAGSUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("AGS User").click();
  }

  checkMunicipalUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("Municipal User").click();
  }

  checkTaxpayerUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("Taxpayer User").click();
  }

  checkSuperUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("Super User").click();
  }

  checkAuditAdminUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("Audit Admin User").click();
  }

  checkCaseManagementUserTypeRadioButton() {
    this.getElement().userTypeRadioButton("Case Management").click();
  }

  typeEmail(email: string) {
    this.getElement().emailInput().type(email);
    pw.wait(3000); // Wait for the email input to be processed
  }
}

export default InviteUserModal;
