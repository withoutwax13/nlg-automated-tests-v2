import { type Page } from "@playwright/test";

class RegistrationRecord {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1").first(),
      activeRegistrationCard: () => this.page.locator("section, div").filter({ hasText: "Active Registration" }).first(),
      downloadCertificateButton: () => this.page.locator("button, a").filter({ hasText: "Download Certificate" }),
      backButton: () => this.page.locator("button, a").filter({ hasText: "Back" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickBackButton() {
    await this.getElements().backButton().click({ force: true });
  }
}

export default RegistrationRecord;
