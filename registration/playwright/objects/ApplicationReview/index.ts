import ApplicationDetail from "./ApplicationDetail";
import Attachment from "./Attachment";
import ManualStep from "./ManualSteps";
import Messages from "./Messages";
import UpdateBusinessDetails from "./UpdateBusinessDetails";

/**
 * Page Object Model (POM) class representing the Application Review page.
 */
class ApplicationReview {
  userType: string;
  applicationDetailTab: ApplicationDetail;
  manualStepsTab: ManualStep;
  messagesTab: Messages;
  updateBusinessDetailsTab: UpdateBusinessDetails;
  attachmentTab: Attachment;

  /**
   * Create a new Application Review page object.
   * @param {Object} props - The properties of the Application Review page object.
   * @param {string} props.userType - The type of user that is logged in.
   * @remarks
   * This constructor initializes the following tabs:
   * - applicationDetailTab - The application details tab.
   * - manualStepsTab - The manual steps tab.
   * - messagesTab - The messages tab.
   * - updateBusinessDetailsTab - The update business details tab.
   * - attachmentTab - The attachment tab.
   */
  constructor(props: { userType: string }) {
    this.userType = props.userType;
    this.applicationDetailTab = new ApplicationDetail();
    this.manualStepsTab = new ManualStep();
    this.messagesTab = new Messages();
    this.updateBusinessDetailsTab = new UpdateBusinessDetails();
    this.attachmentTab = new Attachment();
  }

  /**
   * Get the elements used in the Application Review page.
   * @returns {Object} The elements used in the Application Review page.
   */
  private elements() {
    return {
      pageTitle: () => cy.get("h1").first(),
      goBackToApplicationGridButton: () =>
        cy.get(".NLGButtonSecondary").contains("Applications"),
      nextApplicationButton: () =>
        cy.get(".NLGButtonSecondary").contains("Next"),
      applicationFormTitle: () => cy.get("h1").eq(1),
      registrationTypeAndReferenceIdData: () => cy.get("h3"),
      addressData: () => cy.get("h3").next(),
      applicationStatusData: () => cy.get("h3").parent().next(),
      actionsDropdown: () => cy.get(".NLG-PrimaryDropdown").contains("Actions"),
      reviewStepperTab: () =>
        cy.get("main").find("div").first().find("div").first(),
      reviewChecklist: () =>
        cy.get("main").find("div").first().find("div").eq(1),
      anyList: () => cy.get("li"),
      actionDropdownActionItems: () =>
        cy.get(".k-animation-container").find("li"),
      actionConfirmationModal: () => cy.get(".k-dialog"),
      actionConfirmationModalPrimaryButton: () =>
        this.getElements().actionConfirmationModal().find(".NLGButtonPrimary"),
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
   * Click the "Go back to applications" button.
   */
  clickGoBackApplicationsButton() {
    this.getElements().goBackToApplicationGridButton().click( {force: true} );
  }

  /**
   * Click the "Next" button to review the next application.
   */
  clickNextApplicationToReviewButton() {
    this.getElements().nextApplicationButton().click( {force: true} );
  }

  /**
   * Toggles the actions dropdown and clicks the action item with the given name.
   * @param actionName - The name of the action item to click.
   */
  toggleActions(actionName: string) {
    this.getElements().actionsDropdown().click( {force: true} );
    this.getElements().actionDropdownActionItems().contains(actionName).click( {force: true} );
    this.getElements()
      .actionConfirmationModalPrimaryButton()
      .contains(actionName)
      .click( {force: true} );
    cy.waitForLoading();
  }

  /**
   * Clicks the tab with the given name.
   * @param stepTabName - The name of the tab to click.
   */
  clickReviewStepTab(stepTabName: string) {
    this.getElements()
      .reviewStepperTab()
      .find("button")
      .find("span")
      .contains(stepTabName)
      .click( {force: true} );
  }
}

export default ApplicationReview;
