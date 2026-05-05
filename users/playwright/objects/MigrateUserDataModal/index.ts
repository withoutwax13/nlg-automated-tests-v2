class MigrateUserDataModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      title: () => pw.get(".k-dialog-title"),
      closeModalButton: () => pw.get('button[aria-label="Close"]'),
      modalContent: () => pw.get(".k-dialog-content"),
      cancelButton: () => pw.get("button").contains("Cancel"),
      migrateButton: () => pw.get("button").contains("Migrate"),
      fromEmailInput: () => pw.get("input[name='Email']").first(),
      toEmailInput: () => pw.get("input[name='Email']").last(),
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

  clickMigrateButton() {
    this.elements().migrateButton().click();
  }

  typeFromEmail(email: string) {
    this.elements().fromEmailInput().type(email);
  }

  typeToEmail(email: string) {
    this.elements().toEmailInput().type(email);
  }
}

export default MigrateUserDataModal;
