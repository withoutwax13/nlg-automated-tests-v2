import SetBusinessStatusModal from "../SetBusinessStatusModal";

class BusinessDetails {
  userType: string;
  setBusinessStatusModal: SetBusinessStatusModal;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
    this.setBusinessStatusModal = new SetBusinessStatusModal();
  }

  private elements() {
    return {
      anyList: () => pw.get("li"),
      pageTitle: () => pw.get("h1"),
      toastComponent: () => pw.get(".Toastify"),
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
          .children("div")
          .eq(1)
          .find(".k-switch")
          .parent(),
      taxpayerFormsSectionFormList: () =>
        this.getElement().formsSection().find("div").eq(1),
      formSectionFormListItem: (formName: string) =>
        this.getElement().formsSectionFormList().contains(formName).parent(),

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
      deleteNoteButton: (pos: number) =>
        this.getElement().noteItem(pos).find(".fa-trash"),

      uploadDocumentSection: () =>
        this.getElement().sectionTabs().find("div[class*='businessDetailsSectionContent']"),
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
    this.getElement().backToBusinessesButton().click();
  }

  clickSaveButton() {
    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/**/update").as("updateBusiness");
    this.getElement().saveButton().click();
    pw.wait("@updateBusiness");
    pw.get("@updateBusiness").its("response.statusCode").should("eq", 200);
  }

  clickDiscardChangesButton() {
    this.getElement().discardChangesButton().click();
  }

  clickEditBusinessInfoButton() {
    this.getElement().editBusinessInfoButton().click();
  }

  clickFormsTab() {
    this.getElement().sectionTabsItems("Forms").click();
  }

  clickBusinessStatusTab() {
    this.getElement().sectionTabsItems("Business Status").click();
  }

  clickNotesTab() {
    this.getElement().sectionTabsItems("Notes").click();
  }

  clickDocumentsTab() {
    this.getElement().sectionTabsItems("Documents").click();
  }

  getFormRequirements(aliasVariable) {
    if (this.userType !== "taxpayer") {
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
          pw.get(`@${aliasVariable}`).then((formRequirements: any) => {
            pw.get("@formName").then((formName) => {
              pw.wrap([...formRequirements, formName]).as(aliasVariable);
            });
          });
        });
    } else {
      pw.wrap([]).as(aliasVariable);
      return this.getElement()
        .taxpayerFormsSectionFormList()
        .find("li")
        .each(($form) => {
          pw.wrap($form)
            .invoke("text")
            .then((text) => {
              pw.get(`@${aliasVariable}`).then((formRequirements: any) => {
                pw.wrap([...formRequirements, text]).as(aliasVariable);
              });
            });
        });
    }
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
    this.getElement().startDateDelinquencyTrackingInput().click();
    this.getElement().startDateDelinquencyTrackingInput().type(`${date.month}`);
    this.getElement()
      .startDateDelinquencyTrackingInput()
      .type(`{rightArrow}${date.date}`);
    this.getElement()
      .startDateDelinquencyTrackingInput()
      .type(`{rightArrow}{rightArrow}{backspace}${date.year}`);
  }

  triggerSetBusinessStatusModal() {
    this.getElement().businessCloseDateInput().click();
    this.getElement().businessCloseDateInput().type(`1`);
  }

  setBusinessCloseDate(date: { month: number; date: number; year: number }, changeLastAcceptFilingDate: boolean = true) {
    this.triggerSetBusinessStatusModal();
    this.setBusinessStatusModal.setBusinessCloseDate(date);
    if (changeLastAcceptFilingDate) {
      this.setBusinessStatusModal.setLastAcceptFilingDate({ month: date.month, date: date.date > 28 ? 28 : date.date + 1, year: date.year });
    }
    this.setBusinessStatusModal.setBusinessStatus("Closed");
    this.setBusinessStatusModal.clickSaveButton();
  }

  setOperatingStatus(status: string) {
    if (
      !["Active", "Active/Seasonal", "Inactive", "Closed", "Sold"].includes(
        status
      )
    ) {
      throw new Error("Invalid operating status");
    }
    this.getElement().operatingStatusDropdown().click();
    this.getElement().anyList().contains(status).click();
  }

  clickAddNoteButton() {
    this.getElement().addNoteButton().scrollIntoView();
    this.getElement().addNoteButton().click();
  }

  clickCancelNoteButton() {
    pw.get("button").contains("Cancel").scrollIntoView();
    pw.get("button").contains("Cancel").click();
  }

  addNote(note: string) {
    this.clickAddNoteButton();
    // TODO: Implement Add Note POM
    pw.get("textarea").type(note);
    pw.intercept("PATCH", "https://**.azavargovapps.com/businesses/MunicipalBusiness/Note?businessHandle=**").as("addNote");
    this.getElement().saveButton().click();
    pw.wait("@addNote");
    pw.get("@addNote").its("response.statusCode").should("eq", 200);
  }

  clickNoteItem(pos: number) {
    this.getElement().noteItem(pos).click();
  }

  deleteNoteItem(pos: number) {
    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/update").as("deleteNote");
    this.getElement().deleteNoteButton(pos).click();
    pw.wait("@deleteNote");
    pw.get("@deleteNote").its("response.statusCode").should("eq", 200);
  }

  uploadDocument(fileName: string) {
    pw.intercept("PATCH", "https://**.azavargovapps.com/businesses/MunicipalBusiness/Document/upload?businessHandle=**").as("uploadDocumentPatch");
    pw.intercept("PUT", "https://nlg-businessesdata-**-businessuploadeddocumentsbu-**.s3-fips.**.amazonaws.com/**").as("uploadDocumentPut");
    const fileToUpload = "example.json";
    this.getElement().uploadDocumentButton().click();
    // TODO: Implement Upload Document POM
    pw.get('input[placeholder="Enter file name"]').type(fileName);
    pw.get("#files").attachFile(fileToUpload);
    pw.get(".NLGButtonPrimary").contains("Upload").click();
    pw.wait("@uploadDocumentPatch");
    pw.get("@uploadDocumentPatch").its("response.statusCode").should("eq", 200);
    pw.wait("@uploadDocumentPut");
    pw.get("@uploadDocumentPut").its("response.statusCode").should("eq", 200);
  }

  getBusinessData(businessField: string, valueAlias: string) {
    if (this.userType === "taxpayer") {
      this.getElement()
        .aboutBusinessSection()
        .find("h3")
        .contains("About this business")
        .next()
        .find("div")
        .find("span")
        .contains(businessField)
        .next()
        .invoke("text")
        .then((text) => pw.wrap(text).as(valueAlias));
    } else {
      this.getElement()
        .aboutBusinessSection()
        .find("h3")
        .contains("About this business")
        .next()
        .next()
        .find("div")
        .find("span")
        .contains(businessField)
        .next()
        .invoke("text")
        .then((text) => pw.wrap(text).as(valueAlias));
    }
  }
}

export default BusinessDetails;
