class MigrateUserDataModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      title: () => cy.get(".k-dialog-title"),
      closeModalButton: () => cy.get('button[aria-label="Close"]'),
      modalContent: () => cy.get(".k-dialog-content"),
      cancelButton: () => cy.get("button").contains("Cancel"),
      migrateButton: () => cy.get("button").contains("Migrate"),
      fromEmailInput: () => cy.get("input[name='Email']").first(),
      toEmailInput: () => cy.get("input[name='Email']").last(),
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
