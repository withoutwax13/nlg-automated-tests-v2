import { type Page } from "@playwright/test";
import UploadDocument from "./UploadDocument";

class Attachment {
  uploadDocumentModal: UploadDocument;

  constructor(private readonly page: Page) {
    this.uploadDocumentModal = new UploadDocument(page);
  }

  private elements() {
    return {
      uploadDocumentButton: () => this.page.locator("button").filter({ hasText: "Upload Document" }).first(),
      attachmentItems: () => this.page.locator(".k-expander, .document-item, li"),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickUploadDocumentButton() {
    await this.getElements().uploadDocumentButton().click({ force: true });
  }
}

export default Attachment;
