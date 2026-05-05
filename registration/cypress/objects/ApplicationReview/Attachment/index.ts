import UploadDocumentModal from "../ManualSteps/UploadDocumentModal";

/**
 * Page Object Model (POM) class representing the Attachment tab of Application Review page.
 */
class Attachment {
  uploadDocumentModal: UploadDocumentModal;
  constructor() {
    this.uploadDocumentModal = new UploadDocumentModal();
  }

  /**
   * Get the elements used in the Attachment tab.
   * @returns {Object} The elements used in the Attachment tab.
   */
  private elements() {
    return {
      attachmentFileList: () =>
        cy
          .get("h3")
          .contains("Application Attachments")
          .parent()
          .find("div")
          .first(),
      deleteAttachmentButton: (attachmentName: string, fileName?: string) => {
        if (!fileName) {
          return this.getElements()
            .attachmentFileList()
            .find("span")
            .contains(attachmentName)
            .next()
            .next();
        } else {
          return this.getElements()
            .attachmentFileList()
            .find("a")
            .contains(fileName)
            .parent()
            .next();
        }
      },
      attachmentNameData: (order: number) =>
        this.getElements().attachmentFileList().find("span").eq(order),
      downloadAttachmentButton: (fileName: string) =>
        this.getElements().attachmentFileList().find("a").contains(fileName),
      uploadDocumentButton: () =>
        cy.get(".NLGButtonSecondary").contains("Upload Document"),
    };
  }

  /**
   * Get the elements used in the Attachment tab.
   * @returns {Object} The elements used in the Attachment tab.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Click the Upload Document button.
   */
  clickUploadDocumentButton() {
    this.getElements().uploadDocumentButton().click( {force: true} );
  }

  /**
   * Click the Delete button for the specified attachment.
   * @param attachmentName - The name of the attachment to delete.
   */
  deleteAttachment(attachmentName?: string) {
    this.getElements().deleteAttachmentButton(attachmentName).click( {force: true} );
  }

  /**
   * Download the specified attachment.
   * @param fileName - The name of the attachment to download.
   */
  downloadAttachment(fileName?: string) {
    this.getElements().downloadAttachmentButton(fileName).click;
  }
}

export default Attachment;
