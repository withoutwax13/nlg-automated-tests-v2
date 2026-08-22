import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click the Zoom Out on the details of a selected business, it should zoom the map out and show other businesses on the map", () => {
    test("As a user, If I click the Zoom Out on the details of a selected business, it should zoom the map out and show other businesses on the map", { tag: ["@slot-05", "@ags"] }, async ({page, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();

        
        await agsBusinessGrid.getElement().businessCardListButtons().first().click()

        // store map scale of zoomed in frame
        const prevMapScale = await agsBusinessGrid.getMapScale()

        // store the location count of the zoomed in frame
        const prevLocationCount = await agsBusinessGrid.countVisibleMapLocations();

        await agsBusinessGrid.clickCardZoomOutButton();

        // A zoom out can expose more locations, or only expand the scale when no nearby
        // business exists. Either outcome proves that the map moved out from the selection.
        await expect
            .poll(async () => {
                const newLocationCount = await agsBusinessGrid.countVisibleMapLocations();
                const newMapScale = await agsBusinessGrid.getMapScale();
                return newLocationCount > prevLocationCount
                    || agsBusinessGrid.compareDistances(newMapScale, prevMapScale);
            })
            .toBe(true)

    })
})
