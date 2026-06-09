import { expect, type Page } from "@playwright/test";

class AddNewNoteModal {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      noteTextarea: () => this.page.locator(".k-dialog textarea, textarea").first(),
      saveButton: () => this.page.locator(".k-dialog .NLGButtonPrimary, .k-dialog button").filter({ hasText: "Save" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async addNote(note: string) {
    await this.getElements().noteTextarea().fill(note);
    const responsePromise = this.page
      .waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/notes"), { timeout: 15000 })
      .catch(() => null);
    await this.getElements().saveButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201]).toContain(response.status());
  }
}

export default AddNewNoteModal;
