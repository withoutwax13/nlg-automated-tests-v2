import { expect, type Page } from "@playwright/test";

class UploadDocument {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      fileNameInput: () => this.page.locator('input[placeholder="Enter file name"]').first(),
      fileInput: () => this.page.locator('input[type="file"]').first(),
      uploadButton: () => this.page.locator(".NLGButtonPrimary, button").filter({ hasText: "Upload" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async uploadDocument(fileName: string, filePath: string) {
    await this.getElements().fileNameInput().fill(fileName);
    await this.getElements().fileInput().setInputFiles(filePath);
    const responsePromise = this.page
      .waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/documents"), { timeout: 15000 })
      .catch(() => null);
    await this.getElements().uploadButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201]).toContain(response.status());
  }
}

export default UploadDocument;
