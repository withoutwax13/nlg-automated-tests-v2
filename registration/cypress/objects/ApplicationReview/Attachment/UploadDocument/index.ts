/**
 * Page Object Model (POM) class representing the Upload Document modal as part of the Attachment tab of Application Review page.
 */
class UploadDocument {
  private elements() {
    return {
      modalTitle: () => cy.get(".k-dialog-title"),
      uploadDocumentNameInput: () =>
        cy.get(".upload-document-dialog").find("input"),
      uploadFileInput: () =>
        cy.get(".upload-document-dialog").find("input[type='files']"),
      uploadButton: () => cy.get(".NLGButtonPrimary").contains("Upload"),
      cancelButton: () => cy.get(".NLGButtonSecondary").contains("Cancel"),
    };
  }
  getElements() {
    return this.elements();
  }
  enterUploadName(name: string) {
    this.getElements().uploadDocumentNameInput().type(name);
  }
  clickUploadButton() {
    this.getElements().uploadButton().click( {force: true} );
  }
  clickCancelButton() {
    this.getElements().cancelButton().click( {force: true} );
  }
  uploadFile(fileName: string) {
    const fileToUpload = fileName || "data.json";
    this.elements().uploadFileInput().attachFile(fileToUpload);
    cy.waitForLoading();
  }
}

export default UploadDocument;
