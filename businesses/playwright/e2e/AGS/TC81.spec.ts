import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click the View Less on the details of a selected business, the business details card should be removed from view", () => {
    test("As a user, If I click the View Less on the details of a selected business, the business details card should be removed from view", { tag: ["@slot-06", "@ags"] }, async ({page, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();

        
        await agsBusinessGrid.getElement().businessCardListButtons().first().click()
        await agsBusinessGrid.clickMapCardViewLessButton();
        await expect(agsBusinessGrid.getElement().fullInfoCard()).not.toBeVisible();
        

    })
})
