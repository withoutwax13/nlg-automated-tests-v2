import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should be able to see the blue circle indicators of the business locations in the Map", () => {
    test("As a user, I should be able to see the blue circle indicators of the business locations in the Map", { tag: ["@slot-00", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();
        await expect(agsBusinessGrid.getElement().mapLocationClusters().first()).toBeVisible();
    });
});
