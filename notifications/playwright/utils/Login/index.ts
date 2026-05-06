import { expect, type Page, type Response } from "@playwright/test";
import { login as nativeLogin } from "../../support/native-helpers";

type AccountType = "taxpayer" | "municipal" | "ags";

type LoginParams = {
  accountType?: AccountType;
};

type ResponsePattern = {
  method: string;
  urlPart: string;
};

const getCredentials = (accountType: AccountType) => {
  const prefix = accountType.toUpperCase();
  return {
    username: process.env[`${prefix}_USERNAME`] || process.env.TEST_USERNAME || "",
    password: process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD || "",
  };
};

const isHubspotChat = (response: Response) =>
  response.request().method() === "GET" && response.url().includes("hubspot.com/livechat-public/");

const isLeadFlowConfig = (response: Response) =>
  response.request().method() === "GET" && response.url().includes("hubspot.com/lead-flows-config/");

const isAwsCognito = (response: Response) =>
  response.request().method() === "POST" && response.url().includes("cognito-idp.") && response.url().includes(".amazonaws.com/");

const interceptHubspotChat = (page: Page) => page.waitForResponse((response) => isHubspotChat(response));
const interceptLeadFlowConfig = (page: Page) => page.waitForResponse((response) => isLeadFlowConfig(response));
const interceptAwsCognito = (page: Page) => page.waitForResponse((response) => isAwsCognito(response));

export const waitForApiResponse = async (page: Page, pattern: ResponsePattern): Promise<Response> => {
  const response = await page.waitForResponse((candidate) =>
    candidate.request().method() === pattern.method && candidate.url().includes(pattern.urlPart)
  );
  expect(response.status(), `${pattern.method} ${pattern.urlPart}`).toBe(200);
  return response;
};

export const login = async (page: Page, params: LoginParams = {}): Promise<void> => {
  const accountType = params.accountType || "taxpayer";
  const credentials = getCredentials(accountType);

  const leadFlowResponse = interceptLeadFlowConfig(page);
  const cognitoResponses = Promise.all([interceptAwsCognito(page), interceptAwsCognito(page)]);

  await page.goto("/login");
  await leadFlowResponse;

  const cookieButton = page.locator(".cookie-actions .NLGButtonPrimary").first();
  if (await cookieButton.isVisible().catch(() => false)) {
    await cookieButton.click({ force: true });
  }

  await page.locator('[data-cy="email-address"]').fill(credentials.username);
  await page.locator('[data-cy="password"]').fill(credentials.password);
  await page.locator('[data-cy="sign-in"]').filter({ hasText: "Sign In" }).first().click();

  await cognitoResponses;
};

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  login: nativeLogin,
};