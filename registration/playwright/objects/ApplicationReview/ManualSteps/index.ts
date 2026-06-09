import { expect, type Page } from "@playwright/test";
import { waitForLoading } from "../../../support/native-helpers";
import AddNewNoteModal from "./AddNewNoteModal";
import UploadDocumentModal from "./UploadDocumentModal";

class ManualSteps {
  addNewNoteModal: AddNewNoteModal;
  uploadDocumentModal: UploadDocumentModal;

  constructor(private readonly page: Page) {
    this.addNewNoteModal = new AddNewNoteModal(page);
    this.uploadDocumentModal = new UploadDocumentModal(page);
  }

  private elements() {
    return {
      manualStepDropdown: () => this.page.locator(".k-dropdownlist").first(),
      manualStepItems: () => this.page.locator("li"),
      rejectButton: () => this.page.locator(".NLGButtonSecondaryDanger, button").filter({ hasText: "Reject" }).first(),
      approveButton: () => this.page.locator(".NLGButtonPrimary, button").filter({ hasText: "Approve" }).first(),
      confirmationApproveButton: () => this.page.locator(".k-dialog .NLGButtonPrimary, .k-dialog button").filter({ hasText: "Approve" }).first(),
      confirmationRejectButton: () => this.page.locator(".k-dialog .NLGButtonPrimary, .k-dialog button").filter({ hasText: "Reject" }).first(),
      addNoteButton: () => this.page.locator("button").filter({ hasText: "Add Note" }).first(),
      uploadDocumentButton: () => this.page.locator("button").filter({ hasText: "Upload Document" }).first(),
      internalNotesTab: () => this.page.locator("li, button").filter({ hasText: "Internal Notes" }).first(),
      documentUploadTab: () => this.page.locator("li, button").filter({ hasText: "Document Upload" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async switchManualStep(manualStepTitle: string) {
    await this.getElements().manualStepDropdown().click({ force: true });
    await this.getElements().manualStepItems().filter({ hasText: manualStepTitle }).first().click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async clickApproveButton() {
    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          response.url().includes("/applications/"),
        { timeout: 15000 }
      )
      .catch(() => null);
    await this.getElements().approveButton().click({ force: true });
    if (await this.getElements().confirmationApproveButton().isVisible().catch(() => false)) {
      await this.getElements().confirmationApproveButton().click({ force: true });
    }
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async clickRejectButton() {
    await this.getElements().rejectButton().click({ force: true });
    if (await this.getElements().confirmationRejectButton().isVisible().catch(() => false)) {
      await this.getElements().confirmationRejectButton().click({ force: true });
    }
    await waitForLoading(this.page, 3);
  }

  async clickAddNoteButton() {
    await this.getElements().addNoteButton().click({ force: true });
  }

  async clickUploadDocumentButton() {
    await this.getElements().uploadDocumentButton().click({ force: true });
  }

  async clickInternalNotesTab() {
    await this.getElements().internalNotesTab().click({ force: true });
  }

  async clickDocumentUploadTab() {
    await this.getElements().documentUploadTab().click({ force: true });
  }
}

export default ManualSteps;
