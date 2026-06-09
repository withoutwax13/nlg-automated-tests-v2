import { expect, type Locator, type Page, type Response } from "@playwright/test";

type AccountType = "taxpayer" | "municipal" | "municipality" | "ags" | "municipalDel";

type LoginParams = {
  accountType?: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

type DateParts = {
  month: string | number;
  day?: string | number;
  date?: string | number;
  year: string | number;
};

const normalizeAccountType = (accountType: AccountType) =>
  accountType === "municipality" ? "municipal" : accountType;

const pad = (value: string | number) => String(value).padStart(2, "0");

export const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

export const getEnvironment = () =>
  process.env.environment || process.env.ENVIRONMENT || "dev";

export const getBaseUrl = () => `https://${getEnvironment()}.azavargovapps.com`;

const getCredentials = (accountType: AccountType, accountIndex = 0) => {
  const normalizedType = normalizeAccountType(accountType);
  const validCredentials = {
      taxpayer: [
        {
          username: "valerasoftwares+taxpayer.1@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+taxpayer.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      municipal: [
        {
          username: "valerasoftwares+arrakis@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "valerasoftwares+arrakis.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      ags: [
        {
          username: "johnpatrickyusoresvalera+dev.super@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.2@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.3@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.4@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.5@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.6@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.7@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.8@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.9@gmail.com",
          password: "Ohayoworld.13",
        },
        {
          username: "johnpatrickyusoresvalera+dev.super.10@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
      municipalDel: [
        {
          username: "valerasoftwares+remedios@gmail.com",
          password: "Ohayoworld.13",
        },
      ],
  }
  return {
    username: validCredentials[normalizedType][accountIndex]["username"],
    password: validCredentials[normalizedType][accountIndex]["password"],
  };
};

export const waitForLoading = async (page: Page, seconds = 10) => {
  await page.waitForTimeout(seconds * 1000);
};

export const waitForResponse = async (
  page: Page,
  matcher: string | RegExp | ((response: Response) => boolean),
  action?: () => Promise<void> | void
) => {
  const predicate =
    typeof matcher === "function"
      ? matcher
      : (response: Response) =>
          typeof matcher === "string"
            ? response.url().includes(matcher)
            : matcher.test(response.url());

  const responsePromise = page.waitForResponse(predicate);
  if (action) {
    await action();
  }
  const response = await responsePromise;
  return response;
};

export const expectStatus = async (responsePromise: Promise<Response>, expectedStatus: number) => {
  const response = await responsePromise;
  expect(response.status()).toBe(expectedStatus);
  return response;
};

export const clickByText = async (locator: Locator, text: string) => {
  await locator.filter({ hasText: text }).first().click();
};

export const selectFilterOperation = async (page: Page, dropdown: Locator, operation: string) => {
  await dropdown.waitFor({ state: "visible" });
  const currentOperation = normalizeText(await dropdown.locator(".k-input-value-text").textContent().catch(() => ""));
  if (currentOperation === operation) return;

  const selectButton = dropdown.locator('button[aria-label="select"]').first();
  if (await selectButton.count()) {
    await selectButton.click({ force: true });
  } else {
    await dropdown.click({ force: true });
  }

  await page
    .locator(".k-animation-container:visible .k-list-item-text, .k-popup:visible .k-list-item-text")
    .filter({ hasText: operation })
    .first()
    .click({ force: true });
};

export const selectMultiCheckFilterItem = async (page: Page, filterValue: string) => {
  const popup = page.locator(".k-column-menu-popup:visible, .k-filter-menu-container:visible").last();
  await popup.waitFor({ state: "visible", timeout: 10000 });
  const target = popup.locator(".k-multicheck-wrap li").filter({ hasText: filterValue }).first();
  await target.waitFor({ state: "visible", timeout: 10000 });
  const checkbox = target.locator("input").first();
  if (await checkbox.count()) {
    await checkbox.click({ force: true });
  } else {
    await target.click({ force: true });
  }
  await popup.locator(".k-actions .k-button, button").filter({ hasText: "Filter" }).first().click({ force: true });
};

export const formatDate = ({ month, year, day, date }: DateParts) =>
  `${pad(month)}/${pad(day ?? date ?? "")}/${String(year)}`;

export const setMaskedDateInput = async (input: Locator, value: DateParts) => {
  await input.click();
  await input.fill(formatDate(value));
  await input.press("Tab");
};

export const getColumnOrder = async (headerLocator: Locator, columns: string[]) => {
  const result: Record<string, number> = {};
  const count = await headerLocator.count();

  for (let index = 0; index < count; index += 1) {
    const text = normalizeText(await headerLocator.nth(index).textContent());
    if (columns.includes(text)) {
      result[text] = index;
    }
  }

  return result;
};

export const getVisibilityStatus = (columns: string[], order: Record<string, number>) =>
  Object.fromEntries(columns.map((column) => [column, order[column] !== undefined]));

export const getRowCells = (row: Locator) => row.locator("td");

export const findRowByCellValue = async (
  rows: Locator,
  columnIndex: number,
  value: string,
  exact = true
) => {
  const count = await rows.count();

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const cellText = normalizeText(await getRowCells(row).nth(columnIndex).textContent());
    if ((exact && cellText === value) || (!exact && cellText.includes(value))) {
      return row;
    }
  }

  return null;
};

export const getPagerTotal = async (pagerInfo: Locator) => {
  const text = normalizeText(await pagerInfo.textContent());
  const match = text.match(/of\s+([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};

export const login = async (page: Page, params: LoginParams = {}) => {
  const accountType = params.accountType || "taxpayer";
  const credentials = getCredentials(accountType, params.accountIndex ?? 0);

  await page.goto(`${getBaseUrl()}/login`);
  await expect(page).toHaveURL(/\/login$/);

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();

  await expect(page).not.toHaveURL(`${getBaseUrl()}/login`);
};

export const logout = async (page: Page) => {
  await page.locator(".profileDropDownButton").last().click({ force: true });
  await page.locator(".k-menu-link, span").filter({ hasText: "Log out" }).first().click({ force: true });
  await expect(page).toHaveURL(`${getBaseUrl()}/login`);
};

type RegistrationData = {
  basicInfo: Record<string, any>;
  locationInfo: { locations: Record<string, any>[] };
  applicantInfo: Record<string, any>;
};

const deletePath = (target: Record<string, any>, path: string) => {
  const parts = path.split(".").map((key) => {
    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
    return arrayMatch ? { key: arrayMatch[1], index: Number(arrayMatch[2]) } : { key };
  });

  let current: any = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!current || !(part.key in current)) return;
    current = current[part.key];
    if (part.index !== undefined) {
      if (!Array.isArray(current) || current[part.index] === undefined) return;
      current = current[part.index];
    }
  }

  const finalPart = parts[parts.length - 1];
  if (!current || !(finalPart.key in current)) return;
  if (finalPart.index !== undefined) {
    if (Array.isArray(current[finalPart.key])) {
      delete current[finalPart.key][finalPart.index];
    }
    return;
  }
  delete current[finalPart.key];
};

export const getUniqueRegistrationData = (
  randomSeed: number,
  isMultilocation: boolean,
  missingData?: string[],
  customValues?: Record<string, any>
): RegistrationData => {
  const evaluateCustomValue = (propertyName: string, defaultValue: any) =>
    customValues && Object.prototype.hasOwnProperty.call(customValues, propertyName)
      ? `${defaultValue} ${customValues[propertyName]}`
      : defaultValue;

  const customData: RegistrationData = {
    basicInfo: {
      businessOwnerEmail: evaluateCustomValue("businessOwnerEmail", `testdata${randomSeed}@test.com`),
      businessOwnerFullName: evaluateCustomValue("businessOwnerFullName", `test data owner ${randomSeed}`),
      businessOwnerPhoneNumber: evaluateCustomValue("businessOwnerPhoneNumber", "11111111111"),
      legalBusinessName: evaluateCustomValue("legalBusinessName", `test data business ${randomSeed}`),
      federalIdentificationNumber: evaluateCustomValue("federalIdentificationNumber", "11111111111"),
      legalBusinessAddress1: evaluateCustomValue("legalBusinessAddress1", `test data add1 ${randomSeed}`),
      legalBusinessAddress2: evaluateCustomValue("legalBusinessAddress2", `Suite add2 ${randomSeed}`),
      legalBusinessCity: evaluateCustomValue("legalBusinessCity", `test city data ${randomSeed}`),
      legalBusinessState: evaluateCustomValue("legalBusinessState", "AL"),
      legalBusinessZipCode: evaluateCustomValue("legalBusinessZipCode", "11111111111"),
      isNotManagedByPropertyManagementFirm: evaluateCustomValue("isNotManagedByPropertyManagementFirm", true),
      operatorName: evaluateCustomValue("operatorName", `test data operator ${randomSeed}`),
      operatorTitle: evaluateCustomValue("operatorTitle", `test data title ${randomSeed}`),
      operatorPhoneNumber: evaluateCustomValue("operatorPhoneNumber", "11111111111"),
      operatorEmail: evaluateCustomValue("operatorEmail", `test${randomSeed}@test.com`),
      emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", "11111111111"),
    },
    locationInfo: {
      locations: [
        {
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 1, month: 1, year: 2025 }),
          locationDBA: evaluateCustomValue("locationDBA", `Test Trade Name ${randomSeed} 1`),
          locationAddress1: evaluateCustomValue("locationAddress1", `${randomSeed} Test Address ${randomSeed} #1`),
          locationAddress2: evaluateCustomValue("locationAddress2", `Suite ${randomSeed} #1`),
          locationCity: evaluateCustomValue("locationCity", "Test City"),
          locationState: evaluateCustomValue("locationState", "AL"),
          locationZip: evaluateCustomValue("locationZip", "12341"),
          locationMailingAddress1: evaluateCustomValue("locationMailingAddress1", `${randomSeed} Test Mailing Address ${randomSeed} #1`),
          locationMailingAddress2: evaluateCustomValue("locationMailingAddress2", `Suite ${randomSeed} #1`),
          locationMailingCity: evaluateCustomValue("locationMailingCity", "Test City"),
          locationMailingState: evaluateCustomValue("locationMailingState", "AL"),
          locationMailingZip: evaluateCustomValue("locationMailingZip", "12341"),
          managerOperatorFullName: evaluateCustomValue("managerOperatorFullName", `Test Manager ${randomSeed} 1`),
          managerOperatorPhoneNumber: evaluateCustomValue("managerOperatorPhoneNumber", "11111111111"),
          managerOperatorEmail: evaluateCustomValue("managerOperatorEmail", `manager1dot${randomSeed}@test.com`),
          managerOperatorTitle: evaluateCustomValue("managerOperatorTitle", `Test Manager Title ${randomSeed} 1`),
          emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", "11111111111"),
        },
        {
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 2, month: 2, year: 2025 }),
          locationDBA: evaluateCustomValue("locationDBA", `Test Trade Name ${randomSeed} 2`),
          locationAddress1: evaluateCustomValue("locationAddress1", `${randomSeed} Test Address ${randomSeed} #2`),
          locationAddress2: evaluateCustomValue("locationAddress2", `Suite ${randomSeed} #2`),
          locationCity: evaluateCustomValue("locationCity", "Test City"),
          locationState: evaluateCustomValue("locationState", "AL"),
          locationZip: evaluateCustomValue("locationZip", "12341"),
          locationMailingAddress1: evaluateCustomValue("locationMailingAddress1", `${randomSeed} Test Mailing Address ${randomSeed} #2`),
          locationMailingAddress2: evaluateCustomValue("locationMailingAddress2", `Suite ${randomSeed} #2`),
          locationMailingCity: evaluateCustomValue("locationMailingCity", "Test City"),
          locationMailingState: evaluateCustomValue("locationMailingState", "AL"),
          locationMailingZip: evaluateCustomValue("locationMailingZip", "12341"),
          managerOperatorFullName: evaluateCustomValue("managerOperatorFullName", `Test Manager ${randomSeed} 2`),
          managerOperatorPhoneNumber: evaluateCustomValue("managerOperatorPhoneNumber", "11111111111"),
          managerOperatorEmail: evaluateCustomValue("managerOperatorEmail", `manager2dot${randomSeed}@test.com`),
          managerOperatorTitle: evaluateCustomValue("managerOperatorTitle", `Test Manager Title ${randomSeed} 2`),
          emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", "11111111111"),
        },
      ],
    },
    applicantInfo: {
      agencyName: evaluateCustomValue("agencyName", `Test Agency ${randomSeed}`),
      agencyType: evaluateCustomValue("agencyType", "Accounting Firm"),
      applicantPhoneNumber: evaluateCustomValue("applicantPhoneNumber", "11111111111"),
      applicantEmail: evaluateCustomValue("applicantEmail", `test${randomSeed}@test.com`),
      signature: evaluateCustomValue("signature", `Test Signature ${randomSeed}`),
    },
  };

  if (!isMultilocation) {
    customData.locationInfo.locations = [customData.locationInfo.locations[0]];
  }

  missingData?.forEach((path) => deletePath(customData, path));
  return customData;
};
