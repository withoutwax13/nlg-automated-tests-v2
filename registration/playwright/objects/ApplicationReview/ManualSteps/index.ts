import AddNewNoteModal from "./AddNewNoteModal";
import UploadDocumentModal from "./UploadDocumentModal";

/**
 * Page Object Model (POM) class representing the Manual Step tab of Application Review page.
 */
class ManualStep {
  addNewNoteModal: AddNewNoteModal;
  uploadDocumentModal: UploadDocumentModal;

  constructor() {
    /**
     * @remarks
     * The `addNewNoteModal` and `uploadDocumentModal` classes are used to interact with the modals that appear when adding a new note or uploading a document.
     */
    this.addNewNoteModal = new AddNewNoteModal();
    this.uploadDocumentModal = new UploadDocumentModal();
  }

  /**
   * Get the elements used in the Manual Steps tab.
   * @returns {Object} The elements used in the Manual Steps tab.
   */
  private elements() {
    return {
      manualStepDropdown: () => pw.get("h3").contains("Manual Step").next(),
      rejectButton: () => pw.get(".NLGButtonSecondary").contains("Reject"),
      approveButton: () => pw.get(".NLGButtonPrimary").contains("Approve"),
      manualStepStatusData: () =>
        cy
          .get("h3")
          .contains("Manual Step")
          .parent()
          .next()
          .find("div")
          .first()
          .find("div")
          .first(),
      internalNotesTab: () => pw.get("li").find("a").contains("Internal Notes"),
      documentsTab: () => pw.get("li").find("a").contains("Documents"),
      addNewNoteButton: () =>
        pw.get(".NLGButtonSecondary").contains("Add a Note"),
      noteDataAccordion: () => pw.get(".internalNotesWrapper"),
      uploadDocumentButton: () =>
        pw.get(".NLGButtonSecondary").contains("Upload Document"),
      documentUploadList: () =>
        cy
          .get("li")
          .find("a")
          .contains("Internal Notes")
          .parent()
          .parent()
          .parent()
          .next(),
      documentDeleteButton: (pos: number) =>
        this.getElements()
          .documentUploadList()
          .find(".text-wrap")
          .eq(pos)
          .next()
          .next(),
      documentDownloadButton: (pos: number) =>
        this.getElements()
          .documentUploadList()
          .find(".text-wrap")
          .eq(pos)
          .next(),
      documentName: (pos: number) =>
        this.getElements().documentUploadList().find(".text-wrap").eq(pos),
      manualStepContent: () =>
        cy
          .get("h3")
          .contains("Manual Step")
          .parent()
          .next()
          .find("div")
          .eq(1)
          .find("span")
          .eq(1),
      manualStepApproverInfo: () =>
        pw.get("h3").contains("Manual Step").parent().next().find("p").first(),
      anylist: () => pw.get("li"),
      manualStepConfirmationModal: () => pw.get(".k-dialog"),
      manualStepConfirmationModalApproveButton: () =>
        this.getElements()
          .manualStepConfirmationModal()
          .find(".NLGButtonPrimary")
          .contains("Approve"),
    };
  }

  /**
   * Get the elements used in the Manual Steps tab.
   * @returns {Object} The elements used in the Manual Steps tab.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Switch to a different manual step in the dropdown.
   * @param manualStepTitle - The title of the manual step to switch to.
   */
  switchManualStep(manualStepTitle: string) {
    this.getElements().manualStepDropdown().click( {force: true} );
    this.getElements().anylist().contains(manualStepTitle).click( {force: true} );
  }

  /**
   * Click the Reject button on the Manual Step tab.
   */
  clickRejectButton() {
    this.getElements().rejectButton().click( {force: true} );
  }

  /**
   * Click the Approve button on the Manual Step tab.
   */
  clickApproveButton() {
    this.getElements().approveButton().click( {force: true} );
    this.getElements().manualStepConfirmationModalApproveButton().click( {force: true} );
  }

  /**
   * Click the Add a Note button.
   */
  clickAddNoteButton() {
    this.getElements().addNewNoteButton().click( {force: true} );
  }

  /**
   * Click the Upload Document button.
   */
  clickUploadDocumentButton() {
    this.getElements().uploadDocumentButton().click( {force: true} );
  }

  /**
   * Toggle the note accordion data at the specified position.
   * @param position - The position of the note to toggle.
   */
  toggleNoteData(position: number) {
    this.getElements().noteDataAccordion().find("div").eq(position).click( {force: true} );
  }

  /**
   * Delete the document upload at the specified position.
   * @param position - The position of the document to delete.
   */
  deleteDocumentUpload(position: number) {
    this.getElements().documentDeleteButton(position).click( {force: true} );
  }

  /**
   * Download the document upload at the specified position.
   * @param position - The position of the document to download.
   */
  downloadDocumentUpload(position: number) {
    this.getElements().documentDownloadButton(position).click( {force: true} );
  }

  /**
   * Click the Internal Notes tab.
   */
  clickInternalNotesTab() {
    this.getElements().internalNotesTab().click( {force: true} );
  }

  /**
   * Click the Documents tab.
   */
  clickDocumentUploadTab() {
    this.getElements().documentsTab().click( {force: true} );
  }
}

export default ManualStep;
