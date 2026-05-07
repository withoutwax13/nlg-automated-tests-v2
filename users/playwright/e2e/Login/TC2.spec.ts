import { test } from "@playwright/test";
import { bindRuntime, login } from "../../support/runtime";
import Login from "../../utils/Login";

test.describe("As a municipal user, I should be able to log into the system using valid username and password.", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    await Login.login(page, { accountType: "municipal" });
  });
});