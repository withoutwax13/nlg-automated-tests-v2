import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
test.describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
  });
});