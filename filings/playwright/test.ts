import { test as base, expect } from "@playwright/test";
import { setCurrentPage } from "./pageContext";

export const test = base;
export { expect };

base.beforeEach(async ({ page }) => {
  setCurrentPage(page);
});
