import { expect, type Page } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";
import ApplicationDetail from "./ApplicationDetail";
import Attachment from "./Attachment";
import ManualSteps from "./ManualSteps";
import Messages from "./Messages";
import UpdateBusinessDetails from "./UpdateBusinessDetails";

type ApplicationReviewProps = {
  userType: "ags" | "municipal";
};

class ApplicationReview {
  applicationDetailTab: ApplicationDetail;
  manualStepsTab: ManualSteps;
  messagesTab: Messages;
  updateBusinessDetailsTab: UpdateBusinessDetails;
  attachmentTab: Attachment;

  constructor(private readonly page: Page, private readonly props: ApplicationReviewProps) {
    this.applicationDetailTab = new ApplicationDetail(page);
    this.manualStepsTab = new ManualSteps(page);
    this.messagesTab = new Messages(page);
    this.updateBusinessDetailsTab = new UpdateBusinessDetails(page);
    this.attachmentTab = new Attachment(page);
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1").first(),
      goBackToApplicationGridButton: () => this.page.locator(".NLGButtonSecondary, a, button").filter({ hasText: "Applications" }).first(),
      nextApplicationButton: () => this.page.locator(".NLGButtonSecondary, button").filter({ hasText: "Next" }).first(),
      applicationFormTitle: () => this.page.locator("h1").nth(1),
      registrationTypeAndReferenceIdData: () => this.page.locator("h3").first(),
      addressData: () => this.page.locator("h3").first().locator("xpath=following-sibling::*[1]"),
      applicationStatusData: () => this.page.locator("h2").first().locator("xpath=following-sibling::*[1]"),
      actionsDropdown: () => this.page.locator(".NLG-PrimaryDropdown, button").filter({ hasText: "Actions" }).first(),
      reviewStepperTab: () => this.page.locator("#mainContent main nav, main nav, nav").first(),
      actionDropdownActionItems: () => this.page.locator(".k-animation-container li, .k-popup li, li"),
      actionConfirmationModal: () => this.page.locator(".k-dialog").last(),
      actionConfirmationModalPrimaryButton: (actionName: string) =>
        this.page.locator(".k-dialog .NLGButtonPrimary, .k-dialog button").filter({ hasText: actionName }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickGoBackApplicationsButton() {
    await this.getElements().goBackToApplicationGridButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async clickNextApplicationToReviewButton() {
    await this.getElements().nextApplicationButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async clickReviewStepTab(stepTabName: string) {
    const tab = this.getElements().reviewStepperTab().locator("button, span, li, a, div").filter({ hasText: stepTabName }).first();
    await tab.click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async toggleActions(actionName: "Approve" | "Reject" | string) {
    await this.getElements().actionsDropdown().click({ force: true });
    await this.getElements().actionDropdownActionItems().filter({ hasText: actionName }).first().click({ force: true });

    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          response.url().includes("/applications/"),
        { timeout: 20000 }
      )
      .catch(() => null);
    await this.getElements().actionConfirmationModalPrimaryButton(actionName).click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 5);
  }
}

export default ApplicationReview;
