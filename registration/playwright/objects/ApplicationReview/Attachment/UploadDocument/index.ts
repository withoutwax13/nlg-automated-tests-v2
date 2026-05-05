/**
 * Page Object Model (POM) class representing the Upload Document modal as part of the Attachment tab of Application Review page.
 */
class UploadDocument {
  private elements() {
    return {
      modalTitle: () => pw.get(".k-dialog-title"),
      uploadDocumentNameInput: () =>
        pw.get(".upload-document-dialog").find("input"),
      uploadFileInput: () =>
        pw.get(".upload-document-dialog").find("input[type='files']"),
      uploadButton: () => pw.get(".NLGButtonPrimary").contains("Upload"),
      cancelButton: () => pw.get(".NLGButtonSecondary").contains("Cancel"),
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
    pw.waitForLoading();
  }
}

export default UploadDocument;
