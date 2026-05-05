import { test, expect } from '../../support/pwtest';
test.describe("As an AGS user, I should be able to log into the system using valid username and password.", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags" });
  });
});
