import { expect, type Page } from "@playwright/test";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApprovalGrid from "../../objects/ApprovalGrid";
import AuditLog from "../../objects/AuditLog";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import { login, logout, waitForLoading } from "../../support/native-helpers";

export const GOVERNMENT = "City of Arrakis";
export const MONTHLY_FORM = "Food and Beverage Tax Return (Monthly)";
export const ZERO_PAYMENT_FORM = "ZERO PAYMENT";
export const DEFAULT_BUSINESS = "Arrakis Spice Company 24510";
export const FUNDED_BUSINESS = "Arrakis Spice Company 40056";
export const ZERO_PAYMENT_BUSINESS = "Arrakis Spice Company 34754";
export const DRAFT_BUSINESS = "Arrakis Spice Company 13685";

type SubmitFilingOptions = {
  accountIndex?: number;
  businessName?: string;
  formName?: string;
  government?: string;
  paymentMethodIndex?: number;
  hasPayment?: boolean;
};

export const loginFresh = async (page: Page, params: Parameters<typeof login>[1]) => {
  if (!page.url().includes("/login") && page.url() !== "about:blank") {
    await logout(page).catch(async () => {
      await page.context().clearCookies();
    });
  }
  await login(page, params);
};

export const createTaxpayerFiling = async (page: Page, options: SubmitFilingOptions = {}) => {
  const {
    accountIndex = 0,
    businessName = DEFAULT_BUSINESS,
    formName = MONTHLY_FORM,
    government = GOVERNMENT,
    paymentMethodIndex = 0,
    hasPayment = true,
  } = options;

  await loginFresh(page, { accountType: "taxpayer", accountIndex, notFirstLogin: true });

  const filing = new Filing(page, { isResumingDraftApplication: false });
  const form = new Form(page);
  const preview = new FormPreview(page);
  const payment = new Payment(page);
  const confirmation = new ApplicationConfirmation(page);

  await filing.goToSubmitFormsTab();
  await filing.selectGovernment(government);
  await filing.selectForm(formName);
  await filing.selectBusinessToFile(businessName);
  await form.clickNextbutton(false);
  await form.enterBasicInformation();
  await form.clickNextbutton();
  await form.enterTaxInformation();
  await form.clickNextbutton();
  await form.enterPreparerInformation();
  await form.clickNextbutton();
  await preview.clickSubmitButton();

  if (hasPayment) {
    await payment.payViaAnySavedPaymentMethod(paymentMethodIndex);
  }

  const referenceId = await confirmation.getReferenceId();
  await confirmation.clickCloseButton(hasPayment);
  return referenceId;
};

export const createZeroPaymentFiling = async (page: Page, accountIndex = 3) =>
  createTaxpayerFiling(page, {
    accountIndex,
    businessName: ZERO_PAYMENT_BUSINESS,
    formName: ZERO_PAYMENT_FORM,
    hasPayment: false,
  });

export const createDraftFiling = async (page: Page, accountIndex = 0) => {
  await loginFresh(page, { accountType: "taxpayer", accountIndex, notFirstLogin: true });

  const filing = new Filing(page, { isResumingDraftApplication: false });
  const form = new Form(page);
  await filing.goToSubmitFormsTab();
  await filing.selectGovernment(GOVERNMENT);
  await filing.selectForm(MONTHLY_FORM);
  await filing.selectBusinessToFile(DRAFT_BUSINESS);
  await form.clickNextbutton(false);
  await form.enterBasicInformation();
  await form.saveAndCloseFiling();

  const filingGrid = new FilingGrid(page, { userType: "taxpayer" });
  await filingGrid.init();
  return filingGrid.getDataOfColumn("Reference ID", "Location DBA", DRAFT_BUSINESS);
};

export const deleteMatchingFilingsAsAgs = async (
  page: Page,
  options: {
    accountIndex?: number;
    businessName: string;
    formName?: string;
    maxDeletes?: number;
  }
) => {
  const { accountIndex = 0, businessName, formName = MONTHLY_FORM, maxDeletes = 3 } = options;
  await loginFresh(page, { accountType: "ags", accountIndex, notFirstLogin: true });
  const grid = new FilingGrid(page, { userType: "ags", municipalitySelection: GOVERNMENT });
  await grid.init();
  await grid.filterColumn("Location DBA", businessName, "text", "Contains");
  await grid.filterColumn("Form Name", formName, "multi-select");

  const count = await grid.getElement().rows().count();
  const deleteCount = Math.min(count, maxDeletes);
  for (let index = 0; index < deleteCount; index += 1) {
    await grid.clickClearAllFiltersButton();
    await grid.filterColumn("Location DBA", businessName, "text", "Contains");
    await grid.filterColumn("Form Name", formName, "multi-select");
    await grid.deleteFiling("Location DBA", businessName);
  }
};

export const fundFilingAsAgs = async (page: Page, referenceId: string, accountIndex = 0) => {
  await loginFresh(page, { accountType: "ags", accountIndex, notFirstLogin: true });
  const grid = new FilingGrid(page, { userType: "ags", municipalitySelection: GOVERNMENT });
  await grid.init();
  await grid.updateStatus("Funded", "Reference ID", referenceId);
  return grid;
};

export const openAuditLogForReference = async (page: Page, referenceId: string, accountIndex = 0) => {
  await loginFresh(page, { accountType: "ags", accountIndex, notFirstLogin: true });
  const grid = new FilingGrid(page, { userType: "ags", municipalitySelection: GOVERNMENT });
  await grid.init();
  const auditPage = await grid.checkAuditLog("Reference ID", referenceId);
  return new AuditLog(auditPage);
};

export const approveReference = async (page: Page, referenceId: string, accountIndex = 0) => {
  await loginFresh(page, { accountType: "municipal", accountIndex, notFirstLogin: true });
  const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
  await approvalGrid.init();
  await approvalGrid.selectRowToApprove("Reference ID", referenceId);
};

export const rejectReference = async (page: Page, referenceId: string, accountIndex = 0) => {
  await loginFresh(page, { accountType: "municipal", accountIndex, notFirstLogin: true });
  const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
  await approvalGrid.init();
  await approvalGrid.selectRowToReject("Reference ID", referenceId);
};

export const runInFreshLogin = async (
  page: Page,
  firstAction: () => Promise<void>,
  secondAccount: Parameters<typeof login>[1],
  secondAction: () => Promise<void>
) => {
  await firstAction();
  await logout(page);
  await login(page, { ...secondAccount, notFirstLogin: true });
  await secondAction();
};

export const expectGridHasRows = async (rows: ReturnType<FilingGrid["getElement"]>["rows"]) => {
  await expect.poll(async () => rows().count()).toBeGreaterThan(0);
};

export const setFilingListStartDate = async (grid: FilingGrid, monthsAgo: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  await grid.setStartDate({
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
    year: String(date.getFullYear()),
  });
};

export const expectDatesFromLastMonths = async (grid: FilingGrid, monthsAgo: number) => {
  await setFilingListStartDate(grid, monthsAgo);
  const values = await grid.getColumnCellsData("Filing Date");
  expect(values.length).toBeGreaterThan(0);
};

export const openFilingFromGrid = async (page: Page, referenceId: string, userType: "ags" | "municipal" | "taxpayer") => {
  const grid = new FilingGrid(page, { userType, municipalitySelection: GOVERNMENT });
  await grid.init();
  await grid.toggleActionButton("View", "Reference ID", referenceId);
  await waitForLoading(page, 5);
  await expect(page.locator("body")).toContainText(referenceId);
};
