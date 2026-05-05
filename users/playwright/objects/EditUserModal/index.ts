class EditUserModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      title: () => pw.get(".k-dialog-title"),
      closeModalButton: () => pw.get('button[aria-label="Close"]'),
      modalContent: () => pw.get(".k-dialog-content"),
      isEnabledRadioButton: () => pw.get(".k-checkbox-wrap"),
      isEnabledLabel: () => pw.get(".k-checkbox-label"),
      cancelButton: () => pw.get("button").contains("Cancel"),
      updateButton: () => pw.get("button").contains("Update"),
      firstNameInput: () => pw.find("input[name='FirstName']"),
      lastNameInput: () => pw.find("input[name='LastName']"),
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
