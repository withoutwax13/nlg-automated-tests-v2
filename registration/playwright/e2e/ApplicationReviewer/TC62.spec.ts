import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";
import {
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a reviewer user, I should be able to link/unlink an application record to a business/registration record.", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 7,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await Login.login(page, { accountType: "municipal", accountIndex: 7, notFirstLogin: true });
    const municipalApplicationGrid = new ApplicationGrid(page, { userType: "municipal" });
    const applicationReview = new ApplicationReview(page, { userType: "municipal" });
    await municipalApplicationGrid.init();
    await municipalApplicationGrid.selectRowToReview({
      anchorColumnName: "Registration Record ID",
      anchorValue: registrationRecordId,
    });
    await municipalApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
    await applicationReview.clickReviewStepTab("Manual Steps");
    await applicationReview.manualStepsTab.clickApproveButton();
    await applicationReview.clickReviewStepTab("Business Details");
    await applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
      customData.locationInfo.locations[0].locationAddress1
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink("28832");
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
    await expect(
      applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.getElements().linkExistingComponent()
    ).toBeVisible();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickUndoLinkingButton();
    await expect(
      applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.getElements().linkExistingComponent()
    ).toHaveCount(0);
  });
});
