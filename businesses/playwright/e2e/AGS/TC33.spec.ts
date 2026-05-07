import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS, Gov user, I want the system to prevent deleting a business record with filings", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags" });
    await agsBusinessGrid.init();
    await agsBusinessGrid.deleteBusiness("Test Trade Name 50363 1");
    await expect(agsBusinessGrid.getElement().noRecordFoundComponent()).not.toBeVisible();
  });
});