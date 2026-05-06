import { expect, Page, Response } from "@playwright/test";
import { login as nativeLogin } from "../../support/native-helpers";

type ResponseWaiter = Promise<Response>;

const waitFor = (page: Page, method: string, pattern: RegExp): ResponseWaiter =>
  page.waitForResponse(
    (response) =>
      response.request().method() === method && pattern.test(response.url())
  );

export const interceptAuditAuthLogin = (page: Page): ResponseWaiter =>
  waitFor(page, "POST", /https:\/\/audit\.api\.localgov\.org\/v1\/auth\/login/);

export const waitForAuditAuthLogin = async (waiter: ResponseWaiter) => {
  expect((await waiter).status()).toBe(201);
};

export const interceptDepartments = (page: Page): ResponseWaiter[] => [
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/departments(?:\?.*)?$/),
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/departments(?:\?.*)?$/),
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/departments(?:\?.*)?$/),
];

export const waitForDepartments = async (waiters: ResponseWaiter[]) => {
  for (const waiter of waiters) {
    expect((await waiter).status()).toBe(200);
  }
};

export const interceptSelectedDepartment = (page: Page): ResponseWaiter =>
  waitFor(page, "GET", /https:\/\/audit\.api\.localgov\.org\/v1\/departments$/);

export const waitForSelectedDepartment = async (waiter: ResponseWaiter) => {
  expect((await waiter).status()).toBe(200);
};

export default {
  login: nativeLogin,
  interceptAuditAuthLogin,
  waitForAuditAuthLogin,
  interceptDepartments,
  waitForDepartments,
  interceptSelectedDepartment,
  waitForSelectedDepartment,
};