import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a user, when the business is active, I should be able to update form submission requirements in the business details page", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "ags" });
    await agsBusinessGrid.init();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    const forms = agsBusinessDetails.getElement().formsSectionFormList();
    const count = await forms.count();
    for (let index = 0; index < count; index += 1) {
      await expect(forms.nth(index).locator("input").first()).toBeEnabled();
    }
  });
});