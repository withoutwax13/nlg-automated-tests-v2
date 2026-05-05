import { test } from "@playwright/test";
import { bindRuntime, login } from "../../support/runtime";

test.describe("As an IAIL user, I should be able to log into the system using valid username and password.", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    await login({ accountType: "iail", accountIndex: 1 });
  });
});
