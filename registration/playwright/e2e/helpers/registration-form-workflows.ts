import { type Page } from "@playwright/test";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import Login from "../../utils/Login";
import { getUniqueRegistrationData, logout } from "../../support/native-helpers";

export const BUSINESS_LICENSE_FORM = "Business License (Annual) - E2E #1";
export const ARRAKIS_GOVERNMENT = "City of Arrakis";

export const startBusinessLicenseRegistration = async (
  page: Page,
  accountIndex: number,
  isMultipleLocation: boolean
) => {
  const filing = new Filing(page);
  const form = new Form(page, { isRenewal: false });

  await Login.login(page, { accountType: "taxpayer", accountIndex });
  await filing.goToSubmitFormsTab();
  await filing.selectGovernment(ARRAKIS_GOVERNMENT);
  await filing.selectForm(BUSINESS_LICENSE_FORM);
  await filing.clickSubmitNewRegistrationButton();
  await form.clickNextbutton();
  await form.selectIsRegisteringMultipleLocations(isMultipleLocation);

  return { filing, form };
};

export const enterBasicInformation = async (form: Form, basicInfo: any) => {
  await form.enterBusinessOwnerInformation(basicInfo);
  await form.enterLegalBusinessInformation(basicInfo);
  await form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
  await form.enterEmergencyPhoneNumbers(basicInfo);
};

export const submitBusinessLicenseRegistration = async (
  page: Page,
  options: {
    accountIndex: number;
    formName?: string;
    isOneTime?: boolean;
    hasPayment?: boolean;
    isMultipleLocation?: boolean;
    customValues?: Record<string, any>;
    missingData?: string[];
    paymentMethod?: number;
    randomSeed?: number;
  }
) => {
  const filing = new Filing(page);
  const form = new Form(page, { isRenewal: false });
  const formPreviewPage = new FormPreview(page);
  const payment = new Payment(page);
  const applicationConfirmation = new ApplicationConfirmation(page);
  const isMultipleLocation = options.isMultipleLocation ?? false;
  const customData = getUniqueRegistrationData(
    options.randomSeed ?? Math.floor(Math.random() * 100000000),
    isMultipleLocation,
    options.missingData,
    options.customValues
  );

  await Login.login(page, { accountType: "taxpayer", accountIndex: options.accountIndex });
  await filing.goToSubmitFormsTab();
  await filing.selectGovernment(ARRAKIS_GOVERNMENT);
  await filing.selectForm(options.formName ?? BUSINESS_LICENSE_FORM);
  await filing.clickSubmitNewRegistrationButton(options.isOneTime);
  await form.clickNextbutton();
  await form.selectIsRegisteringMultipleLocations(isMultipleLocation);
  await enterBasicInformation(form, customData.basicInfo);
  await form.clickNextbutton();
  await form.enterLocationDetails(customData.locationInfo.locations as any[]);
  await form.clickNextbutton();
  await form.enterApplicantDetails(customData.applicantInfo as any, true);
  await form.clickNextbutton();
  await formPreviewPage.clickSubmitButton();

  if (options.hasPayment) {
    await payment.payViaAnySavedPaymentMethod(options.paymentMethod ?? 0);
  }

  const referenceId = await applicationConfirmation.getReferenceId();
  await applicationConfirmation.clickCloseButton();
  return { referenceId, customData };
};

export const getRegistrationRecordIdFromTaxpayerGrid = async (
  page: Page,
  referenceId: string
) => {
  const taxpayerApplicationGrid = new ApplicationGrid(page, { userType: "taxpayer" });
  await taxpayerApplicationGrid.init();
  return taxpayerApplicationGrid.getDataOfColumn(
    "Registration Record ID",
    "Reference ID",
    referenceId
  );
};

export const approveReviewerManualStepAndBusinessDetails = async (
  applicationReview: ApplicationReview,
  customData: any,
  options: {
    requirementFormName?: string;
    linkExistingBusinessSearch?: string;
  } = {}
) => {
  const locationAddress = customData.locationInfo.locations[0].locationAddress1;

  await applicationReview.clickReviewStepTab("Manual Steps");
  await applicationReview.manualStepsTab.clickApproveButton();
  await applicationReview.clickReviewStepTab("Business Details");
  await applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(locationAddress);
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();

  if (options.linkExistingBusinessSearch) {
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink(
      options.linkExistingBusinessSearch
    );
    await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
  }

  await applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clicUpdateAddBusinessDetailsButton();
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.clickUpdateFormRequirements(locationAddress);
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.enableForm(
    options.requirementFormName ?? "Food and Beverage"
  );
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.selectDateDelinquencyTrackingStartDate(
    1,
    1,
    2024
  );
  await applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.clickSaveButton();
};

export const reviewRegistrationApplication = async (
  page: Page,
  options: {
    accountType: "ags" | "municipal";
    accountIndex: number;
    registrationRecordId: string;
    customData: any;
    action?: "Approve" | "Reject";
    linkExistingBusinessSearch?: string;
  }
) => {
  const applicationGrid = new ApplicationGrid(page, {
    userType: options.accountType,
    municipalitySelection: options.accountType === "ags" ? ARRAKIS_GOVERNMENT : undefined,
  });
  const applicationReview = new ApplicationReview(page, { userType: options.accountType });

  await Login.login(page, {
    accountType: options.accountType,
    accountIndex: options.accountIndex,
    notFirstLogin: true,
  });
  await applicationGrid.init();
  await applicationGrid.selectRowToReview({
    anchorColumnName: "Registration Record ID",
    anchorValue: options.registrationRecordId,
  });
  await applicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
  await approveReviewerManualStepAndBusinessDetails(applicationReview, options.customData, {
    linkExistingBusinessSearch: options.linkExistingBusinessSearch,
  });
  await applicationReview.toggleActions(options.action ?? "Approve");

  return { applicationGrid, applicationReview };
};

export const payApplicationAsTaxpayer = async (
  page: Page,
  accountIndex: number,
  registrationRecordId: string,
  paymentMethod = 0
) => {
  const taxpayerApplicationGrid = new ApplicationGrid(page, { userType: "taxpayer" });
  const payment = new Payment(page);
  const applicationConfirmation = new ApplicationConfirmation(page);

  await Login.login(page, { accountType: "taxpayer", accountIndex, notFirstLogin: true });
  await taxpayerApplicationGrid.init();
  await taxpayerApplicationGrid.payApplication("Registration Record ID", registrationRecordId);
  await payment.payViaAnySavedPaymentMethod(paymentMethod);
  await applicationConfirmation.clickCloseButton();
};

export const markApprovalPaymentStatus = async (
  page: Page,
  accountIndex: number,
  registrationRecordId: string,
  status = "Fully Paid"
) => {
  const agsApplicationGrid = new ApplicationGrid(page, {
    userType: "ags",
    municipalitySelection: ARRAKIS_GOVERNMENT,
  });

  await Login.login(page, { accountType: "ags", accountIndex, notFirstLogin: true });
  await agsApplicationGrid.init();
  await agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
    status,
    "Registration Record ID",
    registrationRecordId
  );
};

export const approvePayAndFundRegistration = async (
  page: Page,
  options: {
    accountType?: "ags" | "municipal";
    accountIndex: number;
    registrationRecordId: string;
    customData: any;
    linkExistingBusinessSearch?: string;
  }
) => {
  const { applicationReview } = await reviewRegistrationApplication(page, {
    accountType: options.accountType ?? "ags",
    accountIndex: options.accountIndex,
    registrationRecordId: options.registrationRecordId,
    customData: options.customData,
    action: "Approve",
    linkExistingBusinessSearch: options.linkExistingBusinessSearch,
  });
  await applicationReview.clickGoBackApplicationsButton();
  await logout(page);
  await payApplicationAsTaxpayer(page, options.accountIndex, options.registrationRecordId);
  await logout(page);
  await markApprovalPaymentStatus(page, options.accountIndex, options.registrationRecordId);
};
