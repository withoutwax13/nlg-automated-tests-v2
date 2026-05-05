class ManageDelinquencyModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      modalTitle: () => this.getElement().modal().find(".k-dialog-title"),
      closeModalButton: () =>
        this.getElement().modal().find('button[aria-label="Close"]'),
      explanationTextarea: () => this.getElement().modal().find("textarea"),
      notRequiredToSubmitFormsCheckbox: () =>
        this.getElement().modal().find('input[type="checkbox"]'),
      dismissButton: () =>
        this.getElement().modal().find("button").contains("Dismiss"),
      cancelButton: () =>
        this.getElement().modal().find("button").contains("Cancel"),
      businessNameData: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Business Name (DBA)")
          .next(),
      formTitleData: () =>
        this.getElement().modal().find("label").contains("Form Title").next(),
      filingPeriodData: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Filing Period")
          .next(),
      dueDateData: () =>
        this.getElement().modal().find("label").contains("Due Date").next(),
      dismissalExplanationData: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Dismissal Explanation")
          .next(),
      dismisseByData: () =>
        this.getElement().modal().find("label").contains("Dismissed By").next(),
      revertDismissalButton: () =>
        this.getElement().modal().find("button").contains("Revert Dismissal"),
    };
  }
  getElement() {
    return this.elements();
  }

  clickDismissButton() {
    cy.intercept("POST", "https://**.azavargovapps.com/reports/DismissDelinquencyReport/**").as("dismissDelinquencyReport");
    cy.intercept("GET", "https://**.azavargovapps.com/reports/DelinquencyReports/**").as("getDelinquencyReportAfterDismissal");
    this.getElement().dismissButton().click();
    cy.wait("@dismissDelinquencyReport").its("response.statusCode").should("eq", 200);
    cy.wait("@getDelinquencyReportAfterDismissal").its("response.statusCode").should("eq", 200);
    cy.wait(2000); // Wait for 2 seconds to ensure that the dismissal action is fully processed before proceeding with the next steps in the test
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickCloseModalButton() {
    this.getElement().closeModalButton().click();
  }

  typeExplanation(text: string) {
    this.getElement().explanationTextarea().type(text);
  }

  checkNotRequiredToSubmitFormsCheckbox() {
    this.getElement().notRequiredToSubmitFormsCheckbox().check();
  }

  saveBusinessDetails(variableAlias: string) {
    cy.wrap({}).as(variableAlias);
    this.getElement()
      .businessNameData()
      .invoke("text")
      .then(($businessName) => {
        cy.get(`@${variableAlias}`).then((testBusinessData) => {
          cy.wrap({ ...testBusinessData, businessName: $businessName }).as(
            variableAlias
          );
        });
      });
    this.getElement()
      .formTitleData()
      .invoke("text")
      .then(($formTitle) => {
        cy.get(`@${variableAlias}`).then((testBusinessData) => {
          cy.wrap({ ...testBusinessData, formTitle: $formTitle }).as(
            variableAlias
          );
        });
      });
    this.getElement()
      .filingPeriodData()
      .invoke("text")
      .then(($filingPeriod) => {
        cy.get(`@${variableAlias}`).then((testBusinessData) => {
          cy.wrap({ ...testBusinessData, filingPeriod: $filingPeriod }).as(
            variableAlias
          );
        });
      });
  }

  saveDismissalDetails(variableAlias: string) {
    cy.wrap({}).as(variableAlias);
    this.getElement()
      .dismissalExplanationData()
      .invoke("text")
      .then(($dismissalExplanation) => {
        cy.get(`@${variableAlias}`).then((dismissalData) => {
          cy.wrap({
            ...dismissalData,
            dismissalExplanation: $dismissalExplanation,
          }).as(variableAlias);
        });
      });
    this.getElement()
      .dismisseByData()
      .invoke("text")
      .then(($dismissedBy) => {
        cy.get(`@${variableAlias}`).then((dismissalData) => {
          cy.wrap({ ...dismissalData, dismissedBy: $dismissedBy }).as(
            variableAlias
          );
        });
      });
  }

  clickRevertDismissalButton() {
    cy.intercept("POST", "https://**.azavargovapps.com/reports/RevertDismissDelinquencyReport/**").as("revertDismissal");
    this.getElement().revertDismissalButton().click();
    cy.wait("@revertDismissal").its("response.statusCode").should("eq", 200);
  }
}

export default ManageDelinquencyModal;
