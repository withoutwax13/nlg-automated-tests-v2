import { expect } from "@playwright/test";
import ApplicationConfirmation from "../objects/ApplicationConfirmation";
import ApplicationGrid from "../objects/ApplicationGrid";
import ApplicationReview from "../objects/ApplicationReview";
import Filing from "../objects/Filing";
import FilingGrid from "../objects/FilingGrid";
import Form from "../objects/Form";
import FormPreview from "../objects/FormPreview";
import Payment from "../objects/Payment";
import RegistrationGrid from "../objects/RegistrationGrid";
import RegistrationRecord from "../objects/RegistrationRecord";
import {
  getUniqueRegistrationData,
  login,
  logout,
  setStoredValue,
  textOf,
} from "../support/runtime";

type SubmissionParams = {
  accountIndex?: number;
  formName: string;
  isOneTime?: boolean;
  isMultilocation?: boolean;
  missingData?: string[];
  customValues?: Record<string, unknown>;
};

export const createSubmittedApplication = async ({
  accountIndex = 0,
  formName,
  isOneTime = false,
  isMultilocation = false,
  missingData,
  customValues,
}: SubmissionParams) => {
  const randomSeed = Math.floor(Math.random() * 100000);
  const filing = new Filing();
  const form = new Form({ isRenewal: false });
  const formPreviewPage = new FormPreview();
  const applicationConfirmation = new ApplicationConfirmation();
  const customData = await getUniqueRegistrationData(
    randomSeed,
    isMultilocation,
    missingData,
    customValues
  );

  await login({ accountType: "taxpayer", accountIndex });
  await filing.goToSubmitFormsTab();
  await filing.selectGovernment("City of Arrakis");
  await filing.selectForm(formName);
  await filing.clickSubmitNewRegistrationButton(isOneTime);
  await form.clickNextbutton();
  await form.selectIsRegisteringMultipleLocations(isMultilocation);
  await form.enterBusinessOwnerInformation(customData.basicInfo as any);
  await form.enterLegalBusinessInformation(customData.basicInfo as any);
  await form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
  await form.enterEmergencyPhoneNumbers(customData.basicInfo as any);
  await form.clickNextbutton();
  await form.enterLocationDetails((customData.locationInfo as any).locations);
  await form.clickNextbutton();
  await form.enterApplicantDetails(customData.applicantInfo as any, true);
  await form.clickNextbutton();
  await formPreviewPage.clickSubmitButton();
  const referenceId = await textOf(applicationConfirmation.getElement().referenceIdData());
  setStoredValue("referenceId", referenceId);
  await applicationConfirmation.clickCloseButton();

  return { customData, referenceId, randomSeed };
};

export const getTaxpayerRegistrationRecordId = async (referenceId: string) => {
  const taxpayerApplicationGrid = new ApplicationGrid({ userType: "taxpayer" });
  await taxpayerApplicationGrid.init();
  return taxpayerApplicationGrid.getDataOfColumn(
    "Registration Record ID",
    "Reference ID",
    referenceId,
    "registrationRecordId"
  );
};

export const approveApplication = async ({
  reviewerType,
  reviewerIndex,
  registrationRecordId,
  locationAddress1,
  enableForm = "Food and Beverage",
  finalAction = "Approve",
  linkExistingBusinessValue,
}: {
  reviewerType: "municipal" | "ags";
  reviewerIndex: number;
  registrationRecordId: string;
  locationAddress1: string;
  enableForm?: string;
  finalAction?: "Approve" | "Reject";
  linkExistingBusinessValue?: string;
}) => {
  const applicationGrid = new ApplicationGrid({
    userType: reviewerType,
    municipalitySelection: reviewerType === "ags" ? "City of Arrakis" : undefined,
  });
  const applicationReview = new ApplicationReview({ userType: reviewerType });

  await logout();
  await login({
    accountType: reviewerType,
    notFirstLogin: true,
    accountIndex: reviewerIndex,
  });
  await applicationGrid.init();
  await applicationGrid.selectRowToReview({
    anchorColumnName: "Registration Record ID",
    anchorValue: registrationRecordId,
  });
  await applicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
  await applicationReview.clickReviewStepTab("Manual Steps");
  if (finalAction === "Approve") {
    await applicationReview.manualStepsTab.clickApproveButton();
    await applicationReview.clickReviewStepTab("Business Details");
    await applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
      locationAddress1
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
    if (linkExistingBusinessValue) {
      await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
      await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink(
        linkExistingBusinessValue
      );
      await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
    }
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clicUpdateAddBusinessDetailsButton();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickUpdateFormRequirements(
      locationAddress1
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.enableForm(
      enableForm
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.selectDateDelinquencyTrackingStartDate(
      1,
      1,
      2024
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.clickSaveButton();
    await applicationReview.toggleActions("Approve");
  } else {
    await applicationReview.manualStepsTab.clickRejectButton();
    await applicationReview.toggleActions("Reject");
  }

  return { applicationGrid, applicationReview };
};

export const payApplicationAsTaxpayer = async ({
  registrationRecordId,
  taxpayerIndex,
}: {
  registrationRecordId: string;
  taxpayerIndex: number;
}) => {
  const taxpayerApplicationGrid = new ApplicationGrid({ userType: "taxpayer" });
  const paymentPage = new Payment();
  const applicationConfirmation = new ApplicationConfirmation();

  await logout();
  await login({
    accountType: "taxpayer",
    notFirstLogin: true,
    accountIndex: taxpayerIndex,
  });
  await taxpayerApplicationGrid.init();
  await taxpayerApplicationGrid.payApplication("Registration Record ID", registrationRecordId);
  await paymentPage.payViaAnySavedPaymentMethod();
  await applicationConfirmation.clickCloseButton();
};

export const markApprovalPaymentStatus = async ({
  reviewerIndex,
  registrationRecordId,
  toStatus,
}: {
  reviewerIndex: number;
  registrationRecordId: string;
  toStatus: string;
}) => {
  const agsApplicationGrid = new ApplicationGrid({
    userType: "ags",
    municipalitySelection: "City of Arrakis",
  });

  await logout();
  await login({
    accountType: "ags",
    notFirstLogin: true,
    accountIndex: reviewerIndex,
  });
  await agsApplicationGrid.init();
  await agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
    toStatus,
    "Registration Record ID",
    registrationRecordId
  );
};

export const getFilingGridData = async (
  userType: "ags" | "taxpayer",
  accountIndex: number,
  targetColumnName: string,
  anchorColumnName: string,
  anchorValue: string
) => {
  const filingGrid = new FilingGrid({
    userType,
    municipalitySelection: userType === "ags" ? "City of Arrakis" : undefined,
  });

  await logout();
  await login({
    accountType: userType === "ags" ? "ags" : "taxpayer",
    notFirstLogin: true,
    accountIndex,
  });
  await filingGrid.init();
  return filingGrid.getDataOfColumn(targetColumnName, anchorColumnName, anchorValue, targetColumnName);
};

export const openRegistrationRecord = async (registrationRecordId: string) => {
  const registrationGrid = new RegistrationGrid({
    userType: "ags",
    municipalitySelection: "City of Arrakis",
  });
  await registrationGrid.init();
  await registrationGrid.toggleRegistrationActionButton("View", "Registration Record ID", registrationRecordId);
  return new RegistrationRecord();
};

export const expectNoCertificateButton = async (record: RegistrationRecord) => {
  await expect(record.getElements().downloadCertificateButton()).toHaveCount(0);
};
