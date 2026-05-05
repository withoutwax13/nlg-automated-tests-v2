class BusinessDetails {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      anyList: () => cy.get("li"),
      pageTitle: () => cy.get("h1"),
      backToBusinessesButton: () => cy.get(".NLG-Hyperlink").contains("Back"),
      saveButton: () => cy.get(".NLGButtonPrimary").contains("Save"),
      discardChangesButton: () =>
        cy.get(".NLGButtonSecondary").contains("Discard Changes"),
      businessStatusIndicator: () => this.getElement().pageTitle().next(),
      aboutBusinessSection: () => cy.get("section").eq(0),
      editBusinessInfoButton: () =>
        this.getElement()
          .aboutBusinessSection()
          .find(".NLGButtonSecondary")
          .contains("Edit Business Info"),
      businessInfoList: () => this.getElement().editBusinessInfoButton().next(),
      sectionTabs: () => this.getElement().aboutBusinessSection().next(),
      sectionTabsItems: (tabName: string) =>
        this.getElement().sectionTabs().find("ul").find("li").contains(tabName),
      formsSection: () => cy.get("section").eq(1).find("h3").parent().parent(),
      formsSectionTitle: () => this.getElement().formsSection().find("h3"),
      formsSectionHelpText: () => this.getElement().formsSection().find("p"),
      formsSectionFormList: () =>
        this.getElement()
          .formsSection()
          .find("div")
          .eq(1)
          .find(".k-checkbox-wrap"),
      formSectionFormListItem: (formName: string) =>
        this.getElement().formsSectionFormList().contains(formName).parent().parent(),

      businessStatusSection: () =>
        cy.get("section").eq(1).find("h3").parent("section"),
      startDateDelinquencyTrackingInput: () =>
        cy
          .get("label")
          .contains("Start Date for Delinquency Tracking")
          .parent()
          .next()
          .find("input"),
      businessCloseDateInput: () =>
        cy
          .get("label")
          .contains("Business Close Date")
          .parent()
          .next()
          .find("input"),
      operatingStatusDropdown: () =>
        cy.get("label").contains("Operating Status").parent().next().find("i"),

      notesSection: () => this.getElement().sectionTabs().find("div[class*='businessDetailsSectionContent']"),
      addNoteButton: () =>
        this.getElement().notesSection().find("button").contains("Add a Note"),
      noteItems: () => this.getElement().notesSection().find(".k-expander"),
      noteItem: (pos: number) => this.getElement().noteItems().eq(pos),
      deleteNoteButton: (pos: number) => this.getElement().noteItem(pos).find(".fa-trash"),

      uploadDocumentSection: () => this.getElement().sectionTabs().find("div[class*='businessDetailsSectionContent']"),
      uploadDocumentButton: () =>
        this.getElement()
          .uploadDocumentSection()
          .find("button")
          .contains("Upload Document"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickBackToBusinessesButton() {
    this.getElement().backToBusinessesButton().click( {force: true} );
  }

  clickSaveButton() {
    this.getElement().saveButton().scrollIntoView();
    this.getElement().saveButton().click( {force: true} );
  }

  clickDiscardChangesButton() {
    this.getElement().discardChangesButton().click( {force: true} );
  }

  clickEditBusinessInfoButton() {
    this.getElement().editBusinessInfoButton().click( {force: true} );
  }

  clickFormsTab() {
    this.getElement().sectionTabsItems("Forms").click( {force: true} );
  }

  clickBusinessStatusTab() {
    this.getElement().sectionTabsItems("Business Status").click( {force: true} );
  }

  clickNotesTab() {
    this.getElement().sectionTabsItems("Notes").click( {force: true} );
  }

  clickDocumentsTab() {
    this.getElement().sectionTabsItems("Documents").click( {force: true} );
  }

  getFormRequirements(aliasVariable) {
    cy.wrap([]).as(aliasVariable);
    return this.getElement()
      .formsSectionFormList()
      .each(($form, $index) => {
        this.getElement()
          .formsSectionFormList()
          .eq($index)
          .find("span")
          .invoke("text")
          .then((text) => cy.wrap(text).as("formName"));
        cy.get(aliasVariable).then((formRequirements: any) => {
          cy.get("@formName").then((formName) => {
            cy.wrap([...formRequirements, formName]).as(aliasVariable);
          });
        });
      });
  }

  getEnabledFormRequirements(aliasVariable: string) {
    cy.wrap([]).as(aliasVariable);
    return this.getElement()
      .formsSectionFormList()
      .each(($form, $index) => {
        this.getElement()
          .formsSectionFormList()
          .eq($index)
          .find("input")
          .invoke("attr", "checked")
          .then((isChecked) => {
            if (isChecked) {
              this.getElement()
                .formsSectionFormList()
                .eq($index)
                .find("span")
                .invoke("text")
                .then((text) => cy.wrap(text).as("formName"));
              cy.get(aliasVariable).then((enabledFormRequirements: any) => {
                cy.get("@formName").then((formName) => {
                  cy.wrap([...enabledFormRequirements, formName]).as(
                    aliasVariable
                  );
                });
              });
            }
          });
      });
  }

  setStartDateDelinquencyTracking(date: {
    month: number;
    date: number;
    year: number;
  }) {
    this.getElement().startDateDelinquencyTrackingInput().click( {force: true} );
    this.getElement().startDateDelinquencyTrackingInput().type(`${date.month}`);
    this.getElement()
      .startDateDelinquencyTrackingInput()
      .type(`{rightArrow}${date.date}`);
    this.getElement()
      .startDateDelinquencyTrackingInput()
      .type(`{rightArrow}{rightArrow}${date.year}`);
  }

  setBusinessCloseDate(date: { month: number; date: number; year: number }) {
    this.getElement().businessCloseDateInput().click( {force: true} );
    this.getElement().businessCloseDateInput().type(`${date.month}`);
    this.getElement().businessCloseDateInput().type(`{rightArrow}${date.date}`);
    this.getElement()
      .businessCloseDateInput()
      .type(`{rightArrow}{rightArrow}${date.year}`);
  }

  setOperatingStatus(status: string) {
    if (
      !["Active", "Active/Seasonal", "Inactive", "Closed", "Sold"].includes(
        status
      )
    ) {
      throw new Error("Invalid operating status");
    }
    this.getElement().operatingStatusDropdown().click( {force: true} );
    this.getElement().anyList().contains(status).click( {force: true} );
  }

  clickAddNoteButton() {
    this.getElement().addNoteButton().scrollIntoView();
    this.getElement().addNoteButton().click( {force: true} );
  }

  addNote(note: string) {
    this.clickAddNoteButton();
    // TODO: Implement Add Note POM
    cy.get("textarea").type(note);
    this.clickSaveButton();
  }

  clickNoteItem(pos: number) {
    this.getElement().noteItem(pos).click( {force: true} );
  }

  deleteNoteItem(pos: number) {
    this.getElement().deleteNoteButton(pos).click( {force: true} );
    cy.waitForLoading();
  }

  uploadDocument(fileName: string) {
    const fileToUpload = fileName || "data.json";
    this.getElement().uploadDocumentButton().click( {force: true} );
    // TODO: Implement Upload Document POM
    cy.get('input[placeholder="Enter file name"]').type(fileName);
    cy.get('input[type="files"]').attachFile(fileToUpload);
    cy.get(".NLGButtonPrimary").contains("Upload").click( {force: true} );
    cy.waitForLoading();
  }

  enableForm(formName: string) {
    this.getElement().formSectionFormListItem(formName).find("input").check();
    this.clickSaveButton();
    cy.waitForLoading();
  }
}

export default BusinessDetails;