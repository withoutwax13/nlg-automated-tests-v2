import { expect, Page, Response } from "@playwright/test";

const waitForApiResponse = async (
  page: Page,
  label: string,
  predicate: (response: Response) => boolean
): Promise<Response> => {
  const response = await page.waitForResponse(predicate);
  expect(response.status(), `${label} should return HTTP 200`).toBe(200);
  return response;
};

export const waitForAuditXhr = async (page: Page): Promise<Response> => {
  return waitForApiResponse(page, "Audit details", (response) => {
    return (
      response.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/audits\/.+/.test(response.url())
    );
  });
};

export const waitForCaseFields = async (page: Page): Promise<Response> => {
  return waitForApiResponse(page, "Case fields", (response) => {
    return (
      response.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/fields\?departmentTag=.+/.test(
        response.url()
      )
    );
  });
};

export const waitForUsers = async (page: Page): Promise<Response> => {
  return waitForApiResponse(page, "Users", (response) => {
    return (
      response.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/users(?:\?.*)?$/.test(
        response.url()
      )
    );
  });
};
