class RemoveUserModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      title: () => cy.get(".k-dialog-title"),
      closeModalButton: () => cy.get('button[aria-label="Close"]'),
      modalContent: () => cy.get(".k-dialog-content"),
      confirmationRadioButton: () => cy.get("k-checkbox-wrap"),
      confirmationLabel: () => cy.get(".k-checkbox-label"),
      cancelButton: () => cy.get("button").contains("Cancel"),
      deleteButton: () => cy.get("button").contains("Delete"),
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

  clickDeleteButton() {
    this.elements().deleteButton().click();
  }

  checkConfirmationRadioButton() {
    this.elements().confirmationRadioButton().click();
  }
}

export default RemoveUserModal;
