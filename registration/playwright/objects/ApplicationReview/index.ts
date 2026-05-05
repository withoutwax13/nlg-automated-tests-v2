import { currentPage, fillDateInput, listItem, waitForLoading, withText } from "../../support/runtime";

class ApplicationReview {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  getElements() {
    const page = this.page();

    return {
      applicationStatusData: () => page.locator("h3").first().locator("xpath=..").locator("xpath=following-sibling::*[1]"),
      linkExistingComponent: () => page.getByText("You have linked similar business location:", { exact: false }).first(),
    };
  }

  manualStepsTab = {
    clickApproveButton: async () => {
      await withText(this.page().locator(".NLGButtonPrimary"), "Approve").click({ force: true });
      await waitForLoading();
    },
    clickRejectButton: async () => {
      await withText(this.page().locator(".NLGButtonSecondary"), "Reject").click({ force: true });
      await waitForLoading();
    },
  };

  updateBusinessDetailsTab = {
    clickEditBusinessDetailsButton: async () => {
      await withText(this.page().locator(".NLGButtonSecondaryDanger, .NLGButtonSecondary"), "Update Business Details").click({ force: true });
      await waitForLoading();
    },
    updateBusinessList: {
      clickReviewBusinessButton: async (address: string) => {
        const row = this.page().locator("button").filter({ hasText: "Review Business" }).filter({
          has: this.page().locator("xpath=ancestor::*[contains(., '" + address + "')]"),
        }).first();
        await row.click({ force: true }).catch(async () => {
          await this.page().locator("button").filter({ hasText: "Review Business" }).first().click({ force: true });
        });
        await waitForLoading();
      },
      clickUpdateFormRequirements: async (address: string) => {
        const button = this.page()
          .locator("button")
          .filter({ hasText: /Update Form Requirements|Set Form Requirements/ })
          .filter({ has: this.page().locator("xpath=ancestor::*[contains(., '" + address + "')]") })
          .first();
        await button.click({ force: true }).catch(async () => {
          await this.page().locator("button").filter({ hasText: /Update Form Requirements|Set Form Requirements/ }).first().click({ force: true });
        });
        await waitForLoading();
      },
      formRequirementsModal: {
        enableForm: async (formName: string) => {
          const formRow = this.page().locator(".k-dialog-content").locator("div").filter({ hasText: formName }).first();
          const toggle = formRow.locator("input[type='checkbox']").first();
          const checked = await toggle.isChecked().catch(() => false);
          if (!checked) {
            await formRow.click({ force: true });
          }
        },
        selectDateDelinquencyTrackingStartDate: async (month: number, day: number, year: number) => {
          await fillDateInput(this.page().locator(".k-dateinput input").first(), { month, day, year });
        },
        clickSaveButton: async () => {
          await withText(this.page().locator(".NLGButtonPrimary, .k-dialog-actions button"), "Save").click({ force: true });
          await waitForLoading();
        },
      },
      reviewBusinessListModal: {
        getElements: () => this.getElements(),
        disregardSimilarBusinessRecords: async () => {
          await this.page().getByText("Proceed without linking", { exact: false }).first().click({ force: true }).catch(() => undefined);
        },
        toggleLinkExistingBusiness: async () => {
          await this.page().locator("label").filter({ hasText: "Link Existing Business" }).first().click({ force: true });
        },
        selectBusinessLocationToLink: async (value: string) => {
          await this.page().locator("span, label, div").filter({ hasText: value }).first().click({ force: true });
        },
        clickLinkUpdateLinkedBusinessButton: async () => {
          await this.page().locator(".NLGButtonPrimary").filter({ hasText: /Link|Update Linked Business/ }).first().click({ force: true });
          await waitForLoading();
        },
        clickUndoLinkingButton: async () => {
          await this.page().locator("button").filter({ hasText: /Undo Linking|Undo/ }).first().click({ force: true });
        },
        clicUpdateAddBusinessDetailsButton: async () => {
          await this.page().locator(".NLGButtonPrimary").filter({ hasText: /Update|Add Business Details/ }).last().click({ force: true });
          await waitForLoading();
        },
      },
    },
  };

  async clickReviewStepTab(step: string) {
    await this.page().locator("li, a, button").filter({ hasText: step }).first().click({ force: true });
    await waitForLoading();
  }

  async toggleActions(action: "Approve" | "Reject") {
    await withText(this.page().locator(".NLG-PrimaryDropdown, button"), "Actions").click({ force: true });
    await listItem(action).click({ force: true });
    const confirm = this.page().locator(".k-dialog-actions button").filter({ hasText: action }).first();
    if (await confirm.count()) {
      await confirm.click({ force: true });
    }
    await waitForLoading();
  }

  async clickGoBackApplicationsButton() {
    await withText(this.page().locator(".NLGButtonSecondary, .NLGButtonSecondaryFlat"), "Applications").click({ force: true });
    await waitForLoading();
  }
}

export default ApplicationReview;
