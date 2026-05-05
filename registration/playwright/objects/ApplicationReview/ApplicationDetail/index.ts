/**
 * Page Object Model (POM) class representing the Application Detail tab of Application Review page.
 */
class ApplicationDetail {
  /**
   * Get the elements used in the Application Review tab.
   * @returns {Object} The elements used in the Application Review tab.
   */
  private elements() {
    return {
      exportButton: () => pw.get(".NLGButtonSecondary").contains("Export PDF"),
      applicationDataAccordion: () => pw.get(".k-expander-title"),
      finalReviewerSystemInformation: () =>
        pw.get("h4").contains("Application Details").next().find("span").eq(1),
      askForResubmissionButton: () =>
        pw.get(".NLGButtonSecondary").contains("Ask for Resubmission"),
      rejectApplicationButton: () =>
        pw.get(".NLGButtonSecondary").contains("Reject"),
      approveApplicationButton: () =>
        pw.get(".NLGButtonPrimary").contains("Approve"),
    };
  }

  /**
   * Get the elements used in the Application Review page.
   * @returns {Object} The elements used in the Application Review page.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Toggle the Application Data accordion (collapse or expand).
   * @param name - The name of the accordion to toggle.
   * @param toExpand - Whether to expand the accordion (true) or collapse it (false).
   */
  toggleApplicationDataAccordion(name: string, toExpand: boolean) {
    const validNames = [
      "Instructions",
      "Basic Info",
      "Location Info",
      "Applicant Info",
    ];
    if (!validNames.includes(name)) {
      throw new Error("Invalid accordion name for Application Details");
    }

    const toggleAccordion = (expanded: string, shouldExpand: boolean) => {
      if (
        (shouldExpand && expanded === "false") ||
        (!shouldExpand && expanded === "true")
      ) {
        this.getElements().applicationDataAccordion().contains(name).click( {force: true} );
      }
    };

    this.getElements()
      .applicationDataAccordion()
      .contains(name)
      .parent()
      .parent()
      .invoke("attr", "aria-expanded")
      .then((expanded) => toggleAccordion(expanded, toExpand));
  }

  /**
   * Click the "Export" button.
   */
  clickExportButton() {
    this.getElements().exportButton().click( {force: true} );
  }

  /**
   * Click the "Ask for Resubmission" button.
   */
  clickAskForResubmissionButton() {
    this.getElements().askForResubmissionButton().click( {force: true} );
  }

  /**
   * Click the "Reject" button.
   */
  clickRejectApplicationButton() {
    this.getElements().rejectApplicationButton().click( {force: true} );
  }

  /**
   * Click the "Approve" button.
   */
  clickApproveApplicationButton() {
    this.getElements().approveApplicationButton().click( {force: true} );
  }
}

export default ApplicationDetail;
