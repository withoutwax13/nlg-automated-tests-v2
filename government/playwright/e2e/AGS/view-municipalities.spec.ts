import { test } from "@playwright/test";
import path from "path";
import viewMunicipalities from "../../helpers/view-municipalities";

test.describe("As a government user, I want to be able to view the list of Municipalities", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await viewMunicipalities(page, projectRoot);
  });
});
