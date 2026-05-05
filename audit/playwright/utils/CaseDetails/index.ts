import { expect, Page, Response } from "@playwright/test";

type ResponseWaiter = Promise<Response>;

const waitFor = (page: Page, method: string, pattern: RegExp): ResponseWaiter =>
  page.waitForResponse(
    (response) =>
      response.request().method() === method && pattern.test(response.url())
  );

export const interceptAuditXhr = (page: Page): ResponseWaiter =>
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/audits\//);

export const waitForAuditXhr = async (waiter: ResponseWaiter) => {
  expect((await waiter).status()).toBe(200);
};

export const interceptCaseFields = (page: Page): ResponseWaiter =>
  waitFor(
    page,
    "GET",
    /https:\/\/audit\.api\.localgov\.org\/v1\/fields\?departmentTag=.*/
  );

export const waitForCaseFields = async (waiter: ResponseWaiter) => {
  expect((await waiter).status()).toBe(200);
};

export const interceptUsers = (page: Page): ResponseWaiter =>
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/users$/);

export const waitForUsers = async (waiter: ResponseWaiter) => {
  expect((await waiter).status()).toBe(200);
};

export default {
  interceptAuditXhr,
  waitForAuditXhr,
  interceptCaseFields,
  waitForCaseFields,
  interceptUsers,
  waitForUsers,
};
