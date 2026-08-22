import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, When I select the Operation status legend for the map, it should display the filter for different operating status", () => {
    test("As a user, When I select the Operation status legend for the map, it should display the filter for different operating status", { tag: ["@slot-08", "@ags"] }, async ({page, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();

        await agsBusinessGrid.clickMapLegendButton();
        await agsBusinessGrid.clickOperatingStatusLegendButton();

        // check that all operating statuses checkboxes are shown
        await expect(agsBusinessGrid.getElement().legendCheckboxActive()).toBeInViewport();
        await expect(agsBusinessGrid.getElement().legendCheckboxActiveSeasonal()).toBeInViewport();
        await expect(agsBusinessGrid.getElement().legendCheckboxInactive()).toBeInViewport();
        await expect(agsBusinessGrid.getElement().legendCheckboxClosed()).toBeInViewport();
        await expect(agsBusinessGrid.getElement().legendCheckboxSold()).toBeInViewport();
    })
})
