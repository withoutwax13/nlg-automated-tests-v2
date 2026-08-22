import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I turn off the Locations on the layer, I should not see business locations on the map", () => {
    test("As a user, If I turn off the Locations on the layer, I should not see business locations on the map", { tag: ["@slot-00", "@ags"] }, async ({page, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();

        await agsBusinessGrid.clickMapLayersButton();
        await agsBusinessGrid.clickMapLayersLocationsCheckbox();

        await expect(agsBusinessGrid.getElement().mapLayersLocationsCheckbox()).not.toBeChecked();
        await expect
            .poll(() => agsBusinessGrid.countVisibleMapLocations(), { timeout: 30_000 })
            .toBe(0)

    })
})
