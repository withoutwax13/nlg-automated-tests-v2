import { test, expect } from "@playwright/test";
import { expectCurrentUrlToInclude } from "../../support/native-helpers";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
test.describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
  });
});