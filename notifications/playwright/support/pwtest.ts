import { test as base } from "@playwright/test";
import { expect } from "chai";
import path from "path";
import { createPw } from "./pw";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

export const test = base;
export { expect };

base.beforeEach(async ({ page, request }, testInfo) => {
  const testDir = testInfo.project.testDir;
  const playwrightDir = path.resolve(testDir, "..");
  const projectRoot = path.resolve(playwrightDir, "..");

  global.pw = createPw(page, request, projectRoot);
  global.PW = {
    env: (key: string) => {
      if (!key) return undefined;
      const runtimeEnv = global.pw?.__runtime?.envVars || {};
      if (key === "environment") return runtimeEnv.environment;

      if (key === "validCredentials") {
        const fromFixture = runtimeEnv.fixtureData?.accounts;
        if (fromFixture) return fromFixture;
        const fallbackUsername = process.env.TEST_USERNAME || "";
        const fallbackPassword = process.env.TEST_PASSWORD || "";
        const list = Array.from({ length: 10 }, () => ({
          username: fallbackUsername,
          password: fallbackPassword,
        }));
        return {
          taxpayer: list,
          municipal: list,
          ags: list,
          caseManagementTestAccount: list,
          iail: list,
          iatx: list,
        };
      }

      if (key === "testmail") {
        const rawJson = process.env.TESTMAIL || process.env.testmail;
        if (rawJson) {
          try {
            return JSON.parse(rawJson);
          } catch {
            // keep fallback below
          }
        }
        return {
          endpoint: process.env.TESTMAIL_ENDPOINT || "https://api.testmail.app/api/json",
          apiKey: process.env.TESTMAIL_APIKEY || "",
          namespace: process.env.TESTMAIL_NAMESPACE || "",
          domain: process.env.TESTMAIL_DOMAIN || "inbox.testmail.app",
        };
      }

      if (runtimeEnv.fixtureData && Object.prototype.hasOwnProperty.call(runtimeEnv.fixtureData, key)) {
        return runtimeEnv.fixtureData[key];
      }
      const raw = process.env[key] ?? process.env[key.toUpperCase()] ?? process.env[key.toLowerCase()];
      if (raw === undefined) return undefined;
      if (typeof raw !== "string") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    },
    config: (key?: string) => {
      if (!key) return undefined;
      if (key === "downloadsFolder") return path.resolve(projectRoot, "playwright", "downloads");
      return undefined;
    },
    on: () => undefined,
    Promise,
    _: {
      has: (obj: Record<string, unknown>, prop: string) =>
        Object.prototype.hasOwnProperty.call(obj || {}, prop),
    },
  };
});

base.afterEach(async () => {
  if (!global.pw?.__flush) return;
  await Promise.race([
    global.pw.__flush(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
});
