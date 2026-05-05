import { test as base, expect } from "@playwright/test";
import { bindRuntime } from "./runtime";

export const test = base;
export { expect };
export {
  deleteBusinessData,
  expectCurrentUrlToInclude,
  login,
  logout,
} from "./runtime";

base.beforeEach(async ({ page, request }) => {
  bindRuntime(page, request);
});
