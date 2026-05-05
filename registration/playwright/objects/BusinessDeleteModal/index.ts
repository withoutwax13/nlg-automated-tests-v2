class BusinessDeleteModal {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }
  private elements() {
    return {
      modalTitle: () => pw.get(".k-dialog-title"),
      modalContent: () => pw.get(".k-dialog-content"),
      buttonGroup: () => pw.get(".k-dialog-actions"),
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
      closeModalButton: () => pw.get('button[aria-label="Close"]'),
    };
  }
  getElement() {
    return this.elements();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click( {force: true} );
  }

  clickDeleteButton() {
    this.getElement().deleteButton().click( {force: true} );
  }

  clickCloseModalButton() {
    this.getElement().closeModalButton().click( {force: true} );
  }
}

export default BusinessDeleteModal;