/**
 * Page Object Model (POM) class representing the Upload Document Modal within the Manual Step tab of Application Review page.
 */
class UploadDocumentModal {
  /**
   * Get the elements used in the upload document modal.
   * @returns {Object} The elements used in the upload document modal.
   */
    elements() {
      return {
        modalTitle: () => cy.get(".k-dialog-title"),
        fileNameInput: () => cy.get(".k-form-field-wrap").find("input"),
        fileUploadInput: () => cy.get("#files"),
        uploadButton: () =>
          cy.get(".k-dialog-actions").find("button").contains("Upload"),
        cancelButton: () =>
          cy.get(".k-dialog-actions").find("button").contains("Cancel"),
      };
    }
    
    /**
     * Click the Cancel button.
     */
    clickCancelButton() {
      this.elements().cancelButton().click( {force: true} );
    }
  
    /**
     * Click the Upload button.
     */
    clickUploadButton() {
      this.elements().uploadButton().click( {force: true} );
      cy.waitForLoading();
    }
  
    /**
     * Type the name of the document.
     * @param name - The name of the document to enter.
     */
    enterDocumentName(name: string) {
      this.elements().fileNameInput().type(name);
    }
  
    /**
     * Upload a file.
     * @param fileName - The name of the file to upload. This should be found under the cypress/fixtures directory.
     */
    uploadFile(fileName?: string) {
      const fileToUpload = fileName || "data.json";
      this.elements().fileUploadInput().attachFile(fileToUpload);
      cy.waitForLoading();
    }
  }
  
  export default UploadDocumentModal;