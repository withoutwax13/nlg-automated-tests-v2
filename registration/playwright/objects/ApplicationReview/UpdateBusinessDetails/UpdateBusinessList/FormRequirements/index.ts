class FormRequirements {
  constructor() {}
  private elements() {
    return {
      formList: () => pw.get(".k-dialog-content").find("div").eq(1).find("div"),
      locationAddressData: () => pw.get(".k-dialog-content").find("b"),
      startDateDelinquencyTracker: () => pw.get(".k-dateinput").eq(0),
      businessCloseDataTracker: () => pw.get(".k-dateinput").eq(1),
      cancelButton: () => pw.get(".NLGButtonSecondary").contains("Cancel"),
      saveButton: () => pw.get(".NLGButtonPrimary").contains("Save"),
      modalTitle: () => pw.get(".k-dialog-title"),
    };
  }
  getElements() {
    return this.elements();
  }
  enableForm(formName: string) {
    this.getElements()
      .formList()
      .find("label")
      .contains(formName)
      .prev()
      .click( {force: true} );
  }
  disableForm(formName: string) {
    this.getElements()
      .formList()
      .find("label")
      .contains(formName)
      .prev()
      .click( {force: true} );
  }
  selectDateDelinquencyTrackingStartDate(
    month: number,
    date: number,
    year: number
  ) {
    this.getElements().startDateDelinquencyTracker().click( {force: true} );
    this.getElements()
      .startDateDelinquencyTracker()
      .type(`${month}`);
      this.getElements()
      .startDateDelinquencyTracker()
      .type(`{rightArrow}${date}`);
      this.getElements()
      .startDateDelinquencyTracker()
      .type(`{rightArrow}{rightArrow}${year}`);
  }
  selectDateBusinessCloseDate(month: number, date: number, year: number) {
    this.getElements().businessCloseDataTracker().click( {force: true} );
    this.getElements()
      .businessCloseDataTracker()
      .type(`${month}`);
      this.getElements()
      .businessCloseDataTracker()
      .type(`{rightArrow}${date}`);
      this.getElements()
      .businessCloseDataTracker()
      .type(`{rightArrow}{rightArrow}${year}`);
  }
  clickCancelButton() {
    this.getElements().cancelButton().click( {force: true} );
  }
  clickSaveButton() {
    this.getElements().saveButton().click( {force: true} );
  }
}

export default FormRequirements;
