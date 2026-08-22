import { test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should be able to see the lists of business on the left side of the map", () => {
    test("As a user, I should be able to see the lists of business on the left side of the map", { tag: ["@slot-06", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForBusinessCardListToLoad();
    });
});
