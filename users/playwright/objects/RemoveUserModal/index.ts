class RemoveUserModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      title: () => pw.get(".k-dialog-title"),
      closeModalButton: () => pw.get('button[aria-label="Close"]'),
      modalContent: () => pw.get(".k-dialog-content"),
      confirmationRadioButton: () => pw.get("k-checkbox-wrap"),
      confirmationLabel: () => pw.get(".k-checkbox-label"),
      cancelButton: () => pw.get("button").contains("Cancel"),
      deleteButton: () => pw.get("button").contains("Delete"),
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
