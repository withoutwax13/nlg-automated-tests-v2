import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import fixtureData from "../fixtures/data.json";

export type AccountType = "taxpayer" | "municipal" | "ags";

export type LoginParams = {
  accountType: AccountType;
  accountIndex?: number;
  notFirstLogin?: boolean;
};

type RuntimeState = {
  page?: Page;
  request?: APIRequestContext;
  baseURL?: string;
  values: Map<string, unknown>;
};

type RegistrationData = {
  basicInfo: Record<string, unknown>;
  locationInfo: { locations: Record<string, unknown>[] };
  applicantInfo: Record<string, unknown>;
};

const runtime: RuntimeState = {
  values: new Map<string, unknown>(),
};

const isHubspotConfig = (url: string) => url.includes("hubspot.com/lead-flows-config/");
const isAwsCognito = (url: string) => url.includes("cognito-idp.") && url.includes(".amazonaws.com/");

const accounts = ((fixtureData as any).accounts ?? (fixtureData as any).validCredentials) as
  | Record<AccountType, { username: string; password: string }[]>
  | undefined;

const getPage = (): Page => {
  if (!runtime.page) {
    throw new Error("Playwright runtime is not initialized.");
  }

  return runtime.page;
};

export const currentPage = getPage;

export const currentRequest = (): APIRequestContext => {
  if (!runtime.request) {
    throw new Error("Playwright request runtime is not initialized.");
  }

  return runtime.request;
};

export const initTestRuntime = async ({
  page,
  request,
  baseURL,
}: {
  page: Page;
  request?: APIRequestContext;
  baseURL?: string;
}) => {
  runtime.page = page;
  runtime.request = request;
  runtime.baseURL = baseURL;
  runtime.values.clear();
};

export const setStoredValue = <T>(key: string, value: T): T => {
  runtime.values.set(key, value);
  return value;
};

export const getStoredValue = <T>(key: string): T => {
  if (!runtime.values.has(key)) {
    throw new Error(`Stored value not found for key: ${key}`);
  }

  return runtime.values.get(key) as T;
};

export const tryGetStoredValue = <T>(key: string): T | undefined =>
  runtime.values.get(key) as T | undefined;

export const applicationBaseUrl = () =>
  runtime.baseURL || `https://${process.env.environment || process.env.ENVIRONMENT || "dev"}.azavargovapps.com`;

export const expectPathname = async (expected: string | RegExp) => {
  const pathname = new URL(getPage().url()).pathname;
  if (expected instanceof RegExp) {
    expect(pathname).toMatch(expected);
    return;
  }
  expect(pathname).toBe(expected);
};

export const visit = async (url: string) => {
  await getPage().goto(new URL(url, applicationBaseUrl()).toString());
};

export const waitForLoading = async (seconds = 5) => {
  await getPage().waitForLoadState("domcontentloaded").catch(() => undefined);
  await getPage().waitForTimeout(seconds * 1000);
};

export const listItem = (text: string | RegExp): Locator =>
  getPage().locator("li").filter({ hasText: text }).first();

export const withText = (locator: Locator, text: string | RegExp): Locator =>
  locator.filter({ hasText: text }).first();

export const labelValue = (labelText: string): Locator =>
  getPage()
    .locator("label")
    .filter({ hasText: labelText })
    .first()
    .locator("xpath=following-sibling::*[1]");

export const textOf = async (locator: Locator): Promise<string> =>
  ((await locator.first().textContent()) || "").replace(/\s+/g, " ").trim();

export const typeSpecial = async (locator: Locator, value: string) => {
  const input = locator.first();
  const parts = value
    .split(/(\{(?:rightArrow|leftArrow|upArrow|downArrow|backspace)\})/g)
    .filter(Boolean);

  await input.click({ force: true });

  for (const part of parts) {
    switch (part) {
      case "{rightArrow}":
        await input.press("ArrowRight");
        break;
      case "{leftArrow}":
        await input.press("ArrowLeft");
        break;
      case "{upArrow}":
        await input.press("ArrowUp");
        break;
      case "{downArrow}":
        await input.press("ArrowDown");
        break;
      case "{backspace}":
        await input.press("Backspace");
        break;
      default:
        await input.pressSequentially(part, { delay: 10 });
        break;
    }
  }
};

export const fillDateInput = async (
  locator: Locator,
  date: { month: number | string; day?: number | string; date?: number | string; year: number | string }
) => {
  const day = date.day ?? date.date;
  await locator.fill("");
  await typeSpecial(locator, `${date.month}{rightArrow}${day ?? ""}{rightArrow}${date.year}`);
};

const expectedPathByAccountType = (accountType: AccountType) => {
  switch (accountType) {
    case "taxpayer":
      return "/BusinessesApp/BusinessesList";
    case "municipal":
      return "/filingApp/filingList";
    case "ags":
      return "/";
  }
};

export const login = async ({
  accountType,
  accountIndex = 0,
  notFirstLogin = false,
}: LoginParams) => {
  const page = getPage();
  const accountList = accounts?.[accountType];
  const account = accountList?.[accountIndex];
  if (!account) {
    throw new Error(`Missing credentials for ${accountType}[${accountIndex}] in fixtureData.accounts/validCredentials`);
  }
  const leadFlowConfig = page
    .waitForResponse((response) => response.request().method() === "GET" && isHubspotConfig(response.url()))
    .catch(() => undefined);
  const cognitoResponses = Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
    page.waitForResponse((response) => response.request().method() === "POST" && isAwsCognito(response.url())),
  ]);

  await page.goto(new URL("/login", applicationBaseUrl()).toString());
  await leadFlowConfig;
  await expectPathname("/login");

  if (!notFirstLogin) {
    const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click({ force: true });
    }
  }

  await page.locator('[data-cy="email-address"]').fill(account.username);
  await expect(page.locator('[data-cy="email-address"]')).toHaveValue(account.username);
  await page.locator('[data-cy="password"]').fill(account.password);
  await expect(page.locator('[data-cy="password"]')).toHaveValue(account.password);
  await page.locator('[data-cy="sign-in"]').first().click({ force: true });
  await cognitoResponses;
  await expectPathname(expectedPathByAccountType(accountType));
};

export const logout = async () => {
  const page = getPage();
  await page.locator(".profileDropDownButton").last().click({ force: true });
  await page.locator("span").filter({ hasText: "Log out" }).first().click({ force: true });
  await expectPathname("/login");
};

export const getTestmail = () => {
  const rawJson = process.env.TESTMAIL || process.env.testmail;
  let parsed: Record<string, string> = {};

  if (rawJson) {
    try {
      parsed = JSON.parse(rawJson) as Record<string, string>;
    } catch {
      parsed = {};
    }
  }

  return {
    endpoint: process.env.TESTMAIL_ENDPOINT || parsed.endpoint || "https://api.testmail.app/api/json",
    apiKey: process.env.TESTMAIL_APIKEY || parsed.apiKey || "",
    namespace: process.env.TESTMAIL_NAMESPACE || parsed.namespace || "",
    domain: process.env.TESTMAIL_DOMAIN || parsed.domain || "inbox.testmail.app",
  };
};

export const requestJson = async <T>(url: string): Promise<T> => {
  const response = await currentRequest().get(url);
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as T;
};

const buildUniqueRegistrationData = (
  randomSeed: number,
  isMultilocation: boolean,
  missingData?: string[],
  customValues?: Record<string, unknown>
): RegistrationData => {
  const evaluateCustomValue = (propertyName: string, defaultValue: unknown) => {
    if (customValues && Object.prototype.hasOwnProperty.call(customValues, propertyName)) {
      return `${defaultValue} ${String(customValues[propertyName])}`;
    }

    return defaultValue;
  };

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
      emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", "11111111111"),
    },
    locationInfo: {
      locations: [
        {
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 1, month: 1, year: 2024 }),
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
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 2, month: 2, year: 2024 }),
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

  if (missingData) {
    for (const path of missingData) {
      const parts = path.split(".");
      let current: any = customData;

      for (let index = 0; index < parts.length - 1; index += 1) {
        const match = parts[index].match(/(\w+)\[(\d+)\]/);
        if (match) {
          current = current[match[1]][Number(match[2])];
        } else {
          current = current[parts[index]];
        }
        if (!current) {
          break;
        }
      }

      if (!current) {
        continue;
      }

      const last = parts[parts.length - 1];
      const match = last.match(/(\w+)\[(\d+)\]/);
      if (match) {
        delete current[match[1]][Number(match[2])];
      } else {
        delete current[last];
      }
    }
  }

  return customData;
};

export const getUniqueRegistrationData = async (
  randomSeed: number,
  isMultilocation: boolean,
  missingData?: string[],
  customValues?: Record<string, unknown>
) => buildUniqueRegistrationData(randomSeed, isMultilocation, missingData, customValues);
