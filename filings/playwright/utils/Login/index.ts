import type { Page, Response } from "@playwright/test";
import { login as nativeLogin } from "../../support/native-helpers";

const isHubspotChat = (response: Response) =>
  response.request().method() === "GET" &&
  response.url().includes("hubspot.com/livechat-public/");

const isLeadFlowConfig = (response: Response) =>
  response.request().method() === "GET" &&
  response.url().includes("hubspot.com/lead-flows-config/");

const isAwsCognito = (response: Response) =>
  response.request().method() === "POST" &&
  response.url().includes("cognito-idp.") &&
  response.url().includes(".amazonaws.com/");

const interceptHubspotChat = (page: Page) =>
  page.waitForResponse((response) => isHubspotChat(response));

const interceptLeadFlowConfig = (page: Page) =>
  page.waitForResponse((response) => isLeadFlowConfig(response));

const interceptAwsCognito = (page: Page) =>
  page.waitForResponse((response) => isAwsCognito(response));


const loginCompat = async (arg1: unknown, arg2?: unknown) => {
  const looksLikePage =
    !!arg1 && typeof arg1 === "object" && "goto" in (arg1 as Record<string, unknown>);

  if (looksLikePage) {
    return (nativeLogin as unknown as (page: unknown, params?: unknown) => Promise<unknown>)(
      arg1,
      arg2
    );
  }

  return (nativeLogin as unknown as (params: unknown, page?: unknown) => Promise<unknown>)(
    arg1,
    arg2
  );
};

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  login: loginCompat,
};