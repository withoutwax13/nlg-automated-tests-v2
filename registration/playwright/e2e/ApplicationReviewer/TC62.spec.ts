import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import {
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
} from "../helpers";
import { initTestRuntime, login, logout } from "../../support/runtime";

test.describe("As a reviewer user, I should be able to link/unlink an application record to a business/registration record.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const municipalApplicationGrid = new ApplicationGrid({ userType: "municipal" });
    const applicationReview = new ApplicationReview({ userType: "municipal" });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 7,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await logout();
    await login({ accountType: "municipal", notFirstLogin: true, accountIndex: 7 });
    await municipalApplicationGrid.init();
    await municipalApplicationGrid.selectRowToReview({
      anchorColumnName: "Registration Record ID",
      anchorValue: String(registrationRecordId),
    });
    await municipalApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
    await applicationReview.clickReviewStepTab("Manual Steps");
    await applicationReview.manualStepsTab.clickApproveButton();
    await applicationReview.clickReviewStepTab("Business Details");
    await applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
      String(customData.locationInfo.locations[0].locationAddress1)
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink(
      "11038"
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
    await expect(
      applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal
        .getElements()
        .linkExistingComponent()
    ).toBeVisible();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickUndoLinkingButton();
    await expect(
      applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal
        .getElements()
        .linkExistingComponent()
    ).toHaveCount(0);
  });
});
