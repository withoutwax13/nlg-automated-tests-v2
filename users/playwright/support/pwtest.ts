import { test as base } from "@playwright/test";
import { expect } from "chai";
import path from "path";
import { createCy } from "./pwcy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

export const test = base;
export { expect };

base.beforeEach(async ({ page, request }, testInfo) => {
  const testDir = testInfo.project.testDir;
  const playwrightDir = path.resolve(testDir, "..");
  const projectRoot = path.resolve(playwrightDir, "..");

  global.cy = createCy(page, request, projectRoot);
  global.Cypress = {
    env: (key: string) => process.env[key] || process.env[key.toUpperCase()] || process.env[key.toLowerCase()],
    config: () => undefined,
    on: () => undefined,
    Promise,
    _: {
      has: (obj: Record<string, unknown>, prop: string) =>
        Object.prototype.hasOwnProperty.call(obj || {}, prop),
    },
  };
});

base.afterEach(async () => {
  if (!global.cy?.__flush) return;
  await Promise.race([
    global.cy.__flush(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
});
