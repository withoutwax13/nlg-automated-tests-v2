import type { Page, Response } from "@playwright/test";
import { login as nativeLogin } from "../../utils/runtime";

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

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  login: nativeLogin,
};