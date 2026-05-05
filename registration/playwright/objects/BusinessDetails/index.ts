class BusinessDetails {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      anyList: () => pw.get("li"),
      pageTitle: () => pw.get("h1"),
      backToBusinessesButton: () => pw.get(".NLG-Hyperlink").contains("Back"),
      saveButton: () => pw.get(".NLGButtonPrimary").contains("Save"),
      discardChangesButton: () =>
        pw.get(".NLGButtonSecondary").contains("Discard Changes"),
      businessStatusIndicator: () => this.getElement().pageTitle().next(),
      aboutBusinessSection: () => pw.get("section").eq(0),
      editBusinessInfoButton: () =>
        this.getElement()
          .aboutBusinessSection()
          .find(".NLGButtonSecondary")
          .contains("Edit Business Info"),
      businessInfoList: () => this.getElement().editBusinessInfoButton().next(),
      sectionTabs: () => this.getElement().aboutBusinessSection().next(),
      sectionTabsItems: (tabName: string) =>
        this.getElement().sectionTabs().find("ul").find("li").contains(tabName),
      formsSection: () => pw.get("section").eq(1).find("h3").parent().parent(),
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
        pw.get("section").eq(1).find("h3").parent("section"),
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
        pw.get("label").contains("Operating Status").parent().next().find("i"),

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
    pw.wrap([]).as(aliasVariable);
    return this.getElement()
      .formsSectionFormList()
      .each(($form, $index) => {
        this.getElement()
          .formsSectionFormList()
          .eq($index)
          .find("span")
          .invoke("text")
          .then((text) => pw.wrap(text).as("formName"));
        pw.get(aliasVariable).then((formRequirements: any) => {
          pw.get("@formName").then((formName) => {
            pw.wrap([...formRequirements, formName]).as(aliasVariable);
          });
        });
      });
  }

  getEnabledFormRequirements(aliasVariable: string) {
    pw.wrap([]).as(aliasVariable);
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
                .then((text) => pw.wrap(text).as("formName"));
              pw.get(aliasVariable).then((enabledFormRequirements: any) => {
                pw.get("@formName").then((formName) => {
                  pw.wrap([...enabledFormRequirements, formName]).as(
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
    pw.get("textarea").type(note);
    this.clickSaveButton();
  }

  clickNoteItem(pos: number) {
    this.getElement().noteItem(pos).click( {force: true} );
  }

  deleteNoteItem(pos: number) {
    this.getElement().deleteNoteButton(pos).click( {force: true} );
    pw.waitForLoading();
  }

  uploadDocument(fileName: string) {
    const fileToUpload = fileName || "data.json";
    this.getElement().uploadDocumentButton().click( {force: true} );
    // TODO: Implement Upload Document POM
    pw.get('input[placeholder="Enter file name"]').type(fileName);
    pw.get('input[type="files"]').attachFile(fileToUpload);
    pw.get(".NLGButtonPrimary").contains("Upload").click( {force: true} );
    pw.waitForLoading();
  }

  enableForm(formName: string) {
    this.getElement().formSectionFormListItem(formName).find("input").check();
    this.clickSaveButton();
    pw.waitForLoading();
  }
}

export default BusinessDetails;