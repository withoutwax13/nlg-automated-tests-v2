import { currentPage, withText } from "../../support/runtime";

class RegistrationRecord {
  private page() {
    return currentPage();
  }

  getElements() {
    const page = this.page();

    return {
      pageTitle: () => page.locator("h1").first(),
      downloadCertificateButton: () => page.getByText("Download Certificate", { exact: false }).first(),
      downloadApplicationButton: () => page.getByText("Download Application", { exact: false }).first(),
      backToRegistrationGridButton: () => withText(page.locator(".NLGButtonSecondaryFlat, .NLGButtonSecondary"), "Registrations"),
    };
  }

  async clickBackToRegistrationListButton() {
    await this.getElements().backToRegistrationGridButton().click({ force: true });
  }

  async clickDownloadCertificateButton() {
    await this.getElements().downloadCertificateButton().click({ force: true });
  }

  async clickDownloadApplicationButton() {
    await this.getElements().downloadApplicationButton().click({ force: true });
  }
}

export default RegistrationRecord;
