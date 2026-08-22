import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should be able to collapse the business list section", () => {
    test("As a user, I should be able to collapse the business list section", { tag: ["@slot-05", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForBusinessCardListToLoad();
        await agsBusinessGrid.clickCollapseBusinessListButton();
        await expect(agsBusinessGrid.getElement().businessCardList()).not.toBeVisible();
    });
});
