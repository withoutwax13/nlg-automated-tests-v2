import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessDetails from "../../objects/BusinessDetails";
import Login from "../../utils/Login";

const municipalBusinessList = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });

test.describe("As a user, I should be able to reveal the full content of FEIN in business details page", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 6 });
    await municipalBusinessList.init();
    await municipalBusinessList.clickClearAllFiltersButton();
    await municipalBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    const feinBeforeClick = await municipalBusinessDetails.getBusinessData("FEIN/SSN");
    await municipalBusinessDetails.getElement().aboutBusinessSection().locator(".fa-eye-slash").first().click();
    const feinAfterClick = await municipalBusinessDetails.getBusinessData("FEIN/SSN");
    expect(feinBeforeClick).not.toEqual(feinAfterClick);
  });
});