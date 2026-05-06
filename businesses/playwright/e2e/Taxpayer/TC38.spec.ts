import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });
const taxpayerBusinessDetails = new BusinessDetails({ userType: "taxpayer" });

test.describe("As a taxpayer, I should be able to see required forms in my business details page", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "taxpayer" });
    await taxpayerBusinessList.init();
    await taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    const formRequirements = await taxpayerBusinessDetails.getFormRequirements();
    expect(formRequirements.length).toBeGreaterThan(0);
    expect(formRequirements).toContain("Food and Beverage Tax Return (Monthly)");
  });
});