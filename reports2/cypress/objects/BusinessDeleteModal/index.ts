class BusinessDeleteModal {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }
  private elements() {
    return {
      modalTitle: () => cy.get(".k-dialog-title"),
      modalContent: () => cy.get(".k-dialog-content"),
      buttonGroup: () => cy.get(".k-dialog-actions"),
      cancelButton: () =>
        this.getElement()
          .buttonGroup()
          .find(".NLGButtonPrimary")
          .contains("Cancel"),
      deleteButton: () =>
        this.getElement()
          .buttonGroup()
          .find(".NLGButtonSecondary")
          .contains("Delete Business"),
      closeModalButton: () => cy.get('button[aria-label="Close"]'),
    };
  }
  getElement() {
    return this.elements();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickDeleteButton() {
    this.getElement().deleteButton().click();
  }

  clickCloseModalButton() {
    this.getElement().closeModalButton().click();
  }
}

export default BusinessDeleteModal;