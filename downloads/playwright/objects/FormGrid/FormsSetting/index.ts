class FormsSetting {
  private elements() {
    return {
      saveButton: () => pw.get(".k-actions").find("button").contains("Save"),
      cancelButton: () =>
        pw.get(".k-actions").find("button").contains("Cancel"),
      municipalityDropdown: () =>
        pw.get('input[placeholder="Search government and press enter …"]'),
      anyList: () => pw.get("li"),
      forrms: () => pw.get(".k-list-item"),
    };
  }
  getElement() {
    return this.elements();
  }

  clickSaveButton() {
    this.getElement().saveButton().click();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  selectMunicipality(municipality: string) {
    this.getElement().municipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
  }

  saveFormOrders(aliasName: string) {
    pw.wrap([]).as(aliasName);
    this.getElement()
      .forrms()
      .each(($el) => {
        pw.get(`@${aliasName}`).then((formsOrder) => {
          pw.wrap([...formsOrder, $el.text()]).as(aliasName);
        });
      });
  }
}

export default FormsSetting;