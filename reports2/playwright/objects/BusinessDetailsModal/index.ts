class BusinessDetailsModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      modalTitle: () => this.getElement().modal().find(".k-dialog-title"),
      closeModalButton: () =>
        this.getElement().modal().find('button[aria-label="Close"]'),
      businessNameData: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Business Name")
          .next(),
      dbaData: () =>
        this.getElement().modal().find("label").contains("DBA").next(),
      businessPropertyData: (propertyName: string) =>
        this.getElement().modal().find("label").contains(propertyName).next(),
      remittanceRequirementsList: () =>
        this.getElement()
          .modal()
          .find("h3")
          .contains("Remittance Requirements")
          .next(),
    };
  }

  getElement() {
    return this.elements();
  }

  clickCloseModalButton() {
    this.getElement().closeModalButton().click();
  }

  getBusinessPropertyData(propertyName: string) {
    return this.getElement().businessPropertyData(propertyName);
  }

  getRemittanceRequirements(aliasVariable: string) {
    cy.wrap([]).as(aliasVariable);
    this.getElement()
      .remittanceRequirementsList()
      .then(($list) => {
        $list.find("li").each(($li) => {
          cy.wrap($li)
            .invoke("text")
            .then((text) => {
              cy.get(`@${aliasVariable}`).then((remittanceRequirements) => {
                cy.wrap([...remittanceRequirements, text]).as(aliasVariable);
              });
            });
        });
      });
  }
}
