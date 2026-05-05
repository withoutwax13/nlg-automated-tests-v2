class EditUserModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      title: () => cy.get(".k-dialog-title"),
      closeModalButton: () => cy.get('button[aria-label="Close"]'),
      modalContent: () => cy.get(".k-dialog-content"),
      isEnabledRadioButton: () => cy.get(".k-checkbox-wrap"),
      isEnabledLabel: () => cy.get(".k-checkbox-label"),
      cancelButton: () => cy.get("button").contains("Cancel"),
      updateButton: () => cy.get("button").contains("Update"),
      firstNameInput: () => cy.find("input[name='FirstName']"),
      lastNameInput: () => cy.find("input[name='LastName']"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickCloseModalButton() {
    this.elements().closeModalButton().click();
  }

  clickCancelButton() {
    this.elements().cancelButton().click();
  }

  clickUpdateButton() {
    this.elements().updateButton().click();
  }

  checkIsEnabledRadioButton() {
    this.elements().isEnabledRadioButton().click();
  }

  typeFirstName(firstName: string) {
    this.elements().firstNameInput().type(firstName);
  }

  typeLastName(lastName: string) {
    this.elements().lastNameInput().type(lastName);
  }
}

export default EditUserModal;
