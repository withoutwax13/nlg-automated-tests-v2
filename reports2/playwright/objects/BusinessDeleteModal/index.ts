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