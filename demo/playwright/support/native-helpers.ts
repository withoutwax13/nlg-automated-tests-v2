import { expect, type Locator, type Page, type Response } from "@playwright/test";
import fs from "fs";
import path from "path";

type AccountType =
  | "taxpayer"
  | "municipal"
  | "ags"
  | "caseManagementTestAccount"
  | "iail"
  | "iatx";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

type FilterType = "text" | "date" | "number" | "multi-select";

type GridFilterParams = {
  columnName: string;
  filterValue: string;
  filterType?: FilterType;
  filterOperation?: string;
};

type FixtureAccount = {
  username: string;
  password: string;
};

type FixtureData = {
  accounts?: Partial<Record<AccountType, FixtureAccount[]>>;
};

const FORM_NAME = "Food and Beverage";
const LOCATION_DBA = "Test Trade Name 98068 1";

export const getEnvironment = (): string =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = (): string => `https://${getEnvironment()}.azavargovapps.com`;

const getFixtureData = (): FixtureData | undefined => {
  const fixturePath = path.resolve(__dirname, "..", "fixtures", "data.json");
  if (!fs.existsSync(fixturePath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as FixtureData;
  } catch {
    return undefined;
  }
};

const parseValidCredentialsEnv = (): Partial<Record<AccountType, FixtureAccount[]>> | undefined => {
  const raw =
    process.env.validCredentials ||
    process.env.VALIDCREDENTIALS ||
    process.env.VALID_CREDENTIALS;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Partial<Record<AccountType, FixtureAccount[]>>;
  } catch {
    return undefined;
  }
};

const getCredentials = (
  accountType: AccountType,
  accountIndex: number
): FixtureAccount => {
  const fixtureData = getFixtureData();
  const fixtureAccount = fixtureData?.accounts?.[accountType]?.[accountIndex];
  if (fixtureAccount) {
    return fixtureAccount;
  }

  const envMap = parseValidCredentialsEnv();
  const envAccount = envMap?.[accountType]?.[accountIndex] || envMap?.[accountType]?.[0];
  if (envAccount?.username && envAccount?.password) {
    return envAccount;
  }

  const accountTypePrefix = accountType.toUpperCase();
  return {
    username:
      process.env[`${accountTypePrefix}_USERNAME`] ||
      process.env.TEST_USERNAME ||
      "",
    password:
      process.env[`${accountTypePrefix}_PASSWORD`] ||
      process.env.TEST_PASSWORD ||
      "",
  };
};

export const normalizeText = (value: string | null | undefined): string => (value || "").replace(/\s+/g, " ").trim();

export const waitForLoading = async (page: Page, seconds: number = 5) => {
  await page.waitForTimeout(seconds * 1000);
};

export const login = async (
  page: Page,
  params: LoginParams = {}
): Promise<void> => {
  const accountType = params.accountType || "taxpayer";
  const accountIndex = params.accountIndex || 0;
  const credentials = getCredentials(accountType, accountIndex);

  await page.goto(`${getBaseUrl()}/login`);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if ((await cookieButton.count()) > 0) {
    await cookieButton.click({ force: true }).catch(() => undefined);
  }

  if (credentials.username) {
    await page.locator('[data-cy="email-address"]').fill(credentials.username);
  }

  if (credentials.password) {
    await page.locator('[data-cy="password"]').fill(credentials.password);
  }

  await page.locator('[data-cy="sign-in"]').first().click({ force: true });
};

export const logout = async (page: Page): Promise<void> => {
  await page.locator(".profileDropDownButton").last().click({ force: true });
  await page.getByText("Log out", { exact: false }).first().click({ force: true });
};

export const openAgsFilingGrid = async (
  page: Page,
  municipality: string
): Promise<void> => {
  await page.goto(`${getBaseUrl()}/filingApp/filingList`);
  await waitForLoading(page);

  await page
    .locator('input[placeholder="Search government ..."]')
    .first()
    .fill(municipality);
  await page.locator("li").filter({ hasText: municipality }).first().click();
  await waitForLoading(page);

  await page.locator("button").filter({ hasText: "Search" }).first().click();
  await waitForLoading(page);
};

export const openTaxpayerBusinessGrid = async (page: Page): Promise<void> => {
  await page.goto(`${getBaseUrl()}/BusinessesApp/BusinessesList`);
  await waitForLoading(page);
};

const getColumnIndexByName = async (
  page: Page,
  columnName: string
): Promise<number> => {
  const headers = page.locator("thead tr th");
  const headerCount = await headers.count();

  for (let index = 0; index < headerCount; index++) {
    const headerText = normalizeText(await headers.nth(index).innerText());
    if (headerText === columnName) {
      return index;
    }
  }

  throw new Error(`Unable to find grid column: ${columnName}`);
};

export const filterGridColumn = async (
  page: Page,
  {
    columnName,
    filterValue,
    filterType = "text",
    filterOperation = "Contains",
  }: GridFilterParams
): Promise<void> => {
  const columnIndex = await getColumnIndexByName(page, columnName);
  await page
    .locator("thead tr th")
    .nth(columnIndex)
    .locator("span a")
    .first()
    .click({ force: true });

  const filterContainer = page.locator(".k-filter-menu-container").first();

  if (filterType === "multi-select") {
    await filterContainer
      .locator(".k-multicheck-wrap li")
      .filter({ hasText: filterValue })
      .first()
      .click({ force: true });
  } else {
    await filterContainer.locator(".k-dropdownlist").first().click({ force: true });
    await page
      .locator(".k-list-ul li .k-list-item-text")
      .filter({ hasText: filterOperation })
      .first()
      .click({ force: true });

    if (filterType === "date") {
      await filterContainer
        .locator(".k-dateinput input")
        .first()
        .fill(filterValue);
    } else {
      await filterContainer.locator(".k-input").first().fill(filterValue);
    }
  }

  await filterContainer
    .locator(".k-actions .k-button")
    .filter({ hasText: "Filter" })
    .first()
    .click({ force: true });

  await page.waitForTimeout(1500);
};

export const clearAllGridFilters = async (page: Page): Promise<void> => {
  const clearButton = page.getByText("Clear All", { exact: false }).first();
  if ((await clearButton.count()) > 0) {
    await clearButton.click({ force: true });
    await waitForLoading(page, 2);
  }
};

export const getGridRowCount = async (page: Page): Promise<number> => {
  if ((await page.locator(".k-grid-norecords-template").count()) > 0) {
    return 0;
  }
  return page.locator("tbody tr").count();
};

export const deleteAgsFiling = async (
  page: Page,
  anchorColumnName: string,
  anchorValue: string
): Promise<void> => {
  await filterGridColumn(page, {
    columnName: anchorColumnName,
    filterValue: anchorValue,
    filterType: "text",
    filterOperation: "Contains",
  });

  const anchorColumnIndex = await getColumnIndexByName(page, anchorColumnName);
  const paymentStatusColumnIndex = await getColumnIndexByName(page, "Payment Status");

  const rows = page.locator("tbody tr");
  const rowCount = await rows.count();

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const anchorCellText = normalizeText(
      await rows.nth(rowIndex).locator("td").nth(anchorColumnIndex).innerText()
    );

    if (anchorCellText === anchorValue) {
      await rows
        .nth(rowIndex)
        .locator("td")
        .nth(paymentStatusColumnIndex)
        .locator("button")
        .first()
        .click({ force: true });

      await page
        .locator("li")
        .filter({ hasText: "Delete Filing" })
        .first()
        .click({ force: true });

      await page
        .locator(".k-dialog-actions button")
        .filter({ hasText: "Delete" })
        .first()
        .click({ force: true });

      await waitForLoading(page);
      return;
    }
  }
};

export const deleteMultipleAgsFilings = async (
  page: Page,
  count: number
): Promise<void> => {
  for (let index = 0; index < count; index++) {
    await clearAllGridFilters(page);
    await filterGridColumn(page, {
      columnName: "Form Name",
      filterValue: FORM_NAME,
      filterType: "multi-select",
    });
    await deleteAgsFiling(page, "Location DBA", LOCATION_DBA);
  }
};

export const goToSubmitFormsTab = async (page: Page): Promise<void> => {
  const submitFormsTab = page.locator('a[href="/formsApp/ListMunicipalityForms"]').first();
  if ((await submitFormsTab.count()) > 0) {
    await submitFormsTab.click({ force: true });
  } else {
    await page.goto(`${getBaseUrl()}/formsApp/ListMunicipalityForms`);
  }

  await waitForLoading(page);
};

export const selectGovernment = async (
  page: Page,
  government: string
): Promise<void> => {
  await page
    .locator('input[placeholder="Search government and press enter …"]')
    .first()
    .click();
  await page
    .locator('input[placeholder="Search government and press enter …"]')
    .first()
    .fill(government);
  await page.locator("li").filter({ hasText: government }).first().click();
};

export const selectForm = async (page: Page, formName: string): Promise<void> => {
  await page
    .locator('ul[data-cy="ListForms"]')
    .locator("li")
    .filter({ hasText: formName })
    .first()
    .click();
};

const clickNextButton = async (page: Page): Promise<void> => {
  await page
    .locator(".NLGButtonPrimary")
    .filter({ hasText: "Next" })
    .first()
    .click({ force: true });
  await waitForLoading(page);
};

const startFiling = async (page: Page): Promise<void> => {
  const modalTitle = page.locator(".k-dialog-titlebar").first();
  if ((await modalTitle.count()) === 0) {
    return;
  }

  const titleText = await modalTitle.innerText();
  if (titleText.includes("Resume Draft Filing")) {
    await page
      .locator(".NLGButtonSecondary")
      .filter({ hasText: "Create a New Filing" })
      .first()
      .click({ force: true });
  }
};

export const selectBusinessToFile = async (
  page: Page,
  businessDba: string
): Promise<void> => {
  await page
    .locator('*[data-cy="business-dialog-choose-business-comboBox"]')
    .first()
    .click();
  await page
    .locator('*[data-cy="business-dialog-choose-business-comboBox"]')
    .first()
    .fill(businessDba);
  await page.locator("li").filter({ hasText: businessDba }).first().click();

  await clickNextButton(page);
  await startFiling(page);
};

const selectAvailableFilingPeriod = async (
  page: Page,
  monthOffset: number
): Promise<void> => {
  const filingPeriodDate = new Date();
  filingPeriodDate.setMonth(filingPeriodDate.getMonth() - monthOffset);

  const filingPeriodLabel = filingPeriodDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  await page.locator('div[data-cy="Filing Period-dropdown"]').first().click({ force: true });
  await page.locator("li").filter({ hasText: filingPeriodLabel }).first().click();
  await waitForLoading(page);

  const alreadyFiledMessage = page.getByText("You have already filed for this period", {
    exact: false,
  });

  if ((await alreadyFiledMessage.count()) > 0) {
    await selectAvailableFilingPeriod(page, monthOffset + 1);
  }
};

export const enterBasicInformation = async (page: Page): Promise<void> => {
  await selectAvailableFilingPeriod(page, 2);

  await page.locator("#FEIN").fill("123456789");
  await page.locator("#IllinoisBusinessTax").fill("12345678");
  await page
    .locator(
      '*[data-cy="No, I remit taxes for only ONE location on my ST-1 form-radio-button"]'
    )
    .click({ force: true });
  await page
    .locator(
      '*[data-cy="No, I did not file a State ST-1-X form for this filing period-radio-button"]'
    )
    .click({ force: true });
};

export const enterTaxInformation = async (page: Page): Promise<void> => {
  await page.locator("#TotalSales").fill("123456");
};

export const enterPreparerInformation = async (page: Page): Promise<void> => {
  await page.locator("#TaxPreparerFullName").fill("John Doe");
  await page.locator("#Title").fill("Tax Preparer");
  await page.locator("#TaxPreparerPhoneNumber").fill("1234567890");
  await page.locator("#PreparerEmail").fill("test1@test.com");
  await page.locator("#Signature").fill("John Doe");
};

export const proceedToPayment = async (page: Page): Promise<void> => {
  await page
    .locator(".NLGButtonPrimary")
    .filter({ hasText: /Go to Payment|Submit/ })
    .first()
    .click({ force: true });
};

const startNewPaymentMethod = async (page: Page): Promise<void> => {
  const burtonPaymentMethodResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /amazonaws\.com\/.*burton\/payment-method/.test(response.url())
  );

  const paymentPluginResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /i3verticals\.com\/v2\/plugins\/payment\/payment/.test(response.url())
  );

  await page.locator('label[for="newPaymentRadio"]').first().click({ force: true });

  expect((await burtonPaymentMethodResponse).status()).toBe(201);
  expect((await paymentPluginResponse).status()).toBe(200);
  await waitForLoading(page);
};

export const addBankAccountDetails = async (page: Page): Promise<void> => {
  const continuePaymentIframeResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /i3verticals\.com\/v2\/plugins\/payment\/.*\/token/.test(response.url())
  );

  await startNewPaymentMethod(page);

  const frame = page.frameLocator("iframe[src*='i3verticals.com/uapi/plugins']");

  await frame.locator("div[name='tab_bank_account']").click();
  await frame.locator("input[name='first_name']").fill("John");
  await frame.locator("input[name='last_name']").fill("Doe");
  await frame.locator("input[name='address1']").fill("123 Main St");
  await frame.locator("input[name='city']").fill("Chicago");
  await frame.locator("select[name='state']").selectOption({ label: "IL" });
  await frame.locator("input[name='postal_code']").fill("12345");
  await frame
    .locator("input[name='bank_routing_number']")
    .fill("021000021");
  await frame
    .locator("input[name='bank_account_number']")
    .fill("111111111111");
  await frame
    .locator("input[name='bank_confirm_account_number']")
    .fill("111111111111");
  await frame.locator("button").filter({ hasText: "Continue" }).first().click();

  await continuePaymentIframeResponse;
};

export const addDebitCreditCardDetails = async (page: Page): Promise<void> => {
  const continuePaymentIframeResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /i3verticals\.com\/v2\/plugins\/payment\/.*\/token/.test(response.url())
  );

  await startNewPaymentMethod(page);

  const frame = page.frameLocator("iframe[src*='i3verticals.com/uapi/plugins']");

  await frame.locator("input[name='first_name']").fill("John");
  await frame.locator("input[name='last_name']").fill("Doe");
  await frame.locator("input[name='address1']").fill("123 Main St");
  await frame.locator("input[name='city']").fill("Chicago");
  await frame.locator("select[name='state']").selectOption({ label: "IL" });
  await frame.locator("input[name='postal_code']").fill("12345");
  await frame
    .locator("input[name='cc_number']")
    .fill("4111111111111111");
  await frame.locator("input[name='cc_expiration']").fill("02/27");
  await frame.locator("input[name='cc_cvv']").fill("123");
  await frame.locator("button").filter({ hasText: "Continue" }).first().click();

  await continuePaymentIframeResponse;
};

export const savePaymentMethodAndFinishPayment = async (
  page: Page
): Promise<void> => {
  await page
    .locator("input[data-cy='Save this payment method for future use-checkbox']")
    .click({ force: true });
  await page
    .locator(
      'input[data-cy="I have read and agree to the Terms and Conditions of this online payment system.-checkbox"]'
    )
    .click({ force: true });
  await waitForLoading(page);

  await page.locator("button").filter({ hasText: "Finish and Pay" }).first().click();
};

export const closeApplicationConfirmation = async (
  page: Page
): Promise<void> => {
  await page.locator(".NLGButtonPrimary").filter({ hasText: "Close" }).first().click();
};

export const openProfile = async (page: Page): Promise<void> => {
  await page.goto(`${getBaseUrl()}/profile`);
  await waitForLoading(page);
};

export const countSavedBankAccounts = async (page: Page): Promise<number> => {
  const bankAccordion = page
    .locator(".k-expander-header")
    .filter({ hasText: "Saved Bank Accounts" })
    .first();
  await bankAccordion.click({ force: true });

  return bankAccordion
    .locator("xpath=../following-sibling::*[1]")
    .locator(".k-expander-content > div")
    .count();
};

export const countSavedCreditDebitCards = async (
  page: Page
): Promise<number> => {
  const cardsAccordion = page
    .locator(".k-expander-header")
    .filter({ hasText: "Saved Credit/Debit Cards" })
    .first();
  await cardsAccordion.click({ force: true });

  return cardsAccordion
    .locator("xpath=../following-sibling::*[1]")
    .locator(".k-expander-content > div")
    .count();
};

export const gridHasNoRecords = async (page: Page): Promise<boolean> =>
  (await page.locator(".k-grid-norecords-template").count()) > 0;

export const clickAddBusinessButton = async (page: Page): Promise<void> => {
  await page
    .locator(".NLGNewLayoutSecondaryButton")
    .filter({ hasText: "Add a Business" })
    .first()
    .click();
};

export const addBusinessToTaxpayerAccount = async (
  page: Page,
  businessDba: string
): Promise<void> => {
  const subscribeBusinessResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      /azavargovapps\.com\/businesses\/taxpayerBusinesses\/subscribe\//.test(
        response.url()
      )
  );

  const municipalityConfigResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /azavargovapps\.com\/businesses\/municipalityBusinessConfig\//.test(
        response.url()
      )
  );

  await page.locator(".k-combobox input").first().fill("Arrakis");
  await page.locator("li").filter({ hasText: "Arrakis" }).first().click();

  expect((await municipalityConfigResponse).status()).toBe(200);

  await page
    .locator("label")
    .filter({ hasText: "Business Details" })
    .first()
    .locator("xpath=following-sibling::*[1]//input[@role='combobox']")
    .fill(businessDba);

  await page.locator("li").filter({ hasText: businessDba }).first().click();
  await page.locator("h2").first().click();

  await page
    .locator(".NLGButtonPrimary")
    .filter({ hasText: "Add Business" })
    .first()
    .click();

  expect((await subscribeBusinessResponse).status()).toBe(201);
};


export const waitForResponse = async (
  page: Page,
  matcher: string | RegExp | ((response: Response) => boolean),
  action?: () => Promise<void> | void
) => {
  const predicate = typeof matcher === "function" ? matcher : (response: Response) => typeof matcher === "string" ? response.url().includes(matcher) : matcher.test(response.url());
  const responsePromise = page.waitForResponse(predicate);
  if (action) await action();
  return responsePromise;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

type DateParts = { month: string | number; day?: string | number; date?: string | number; year: string | number };
const pad = (value: string | number) => String(value).padStart(2, "0");
export const formatDate = ({ month, year, day, date }: DateParts) => `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;
export const setMaskedDateInput = async (input: Locator, value: DateParts) => { await input.click(); await input.fill(formatDate(value)); await input.press("Tab"); };
export const getColumnOrder = async (headerLocator: Locator, columns: string[]) => { const result: Record<string, number> = {}; const count = await headerLocator.count(); for (let i=0;i<count;i+=1){ const text=normalizeText(await headerLocator.nth(i).textContent()); if(columns.includes(text)) result[text]=i;} return result; };
export const getVisibilityStatus = (columns: string[], order: Record<string, number>) => Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));
export const getRowCells = (row: Locator) => row.locator("td");
export const findRowByCellValue = async (rows: Locator, columnIndex: number, value: string, exact = true) => { const count = await rows.count(); for (let i=0;i<count;i+=1){ const row=rows.nth(i); const cellText=normalizeText(await getRowCells(row).nth(columnIndex).textContent()); if ((exact && cellText===value) || (!exact && cellText.includes(value))) return row; } return null; };
export const getPagerTotal = async (pagerInfo: Locator) => { const text = normalizeText(await pagerInfo.textContent()); const match = text.match(/of\s+([\d,]+)/i); return match ? Number(match[1].replace(/,/g, "")) : 0; };
