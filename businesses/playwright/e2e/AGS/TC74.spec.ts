import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

// compares the size of the business card list to the number of pins visible on the map
test.describe("If the area on the map have multiple businesses I should see the number in the circle indicator of the map", () => {
  test("If the area on the map have multiple businesses I should see the number in the circle indicator of the map", { tag: ["@slot-09", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapNodeLoad();
    await expect(agsBusinessGrid.getElement().mapLocationClusters().first()).toBeVisible();

    const scaleBeforeZoom = await agsBusinessGrid.getMapScale();

    // Zoom in twice so we have fewer pins and clusters to work with.
    await agsBusinessGrid.clickMapZoomInButton();
    await agsBusinessGrid.clickMapZoomInButton();
    await expect
      .poll(async () =>
        agsBusinessGrid.compareDistances(scaleBeforeZoom, await agsBusinessGrid.getMapScale()),
      )
      .toBe(true);
    await agsBusinessGrid.waitForMapNodeLoad();

    // must scroll through business card infinite scroll to get the list of all visible businesses
    await agsBusinessGrid.scrollBusinessCardListToBottom();
    const businessCardListSize = await agsBusinessGrid.getElement().businessCardListButtons().count();
    // Scrolling gives marker clustering time to finish after the map animation.
    const locationsSum = await agsBusinessGrid.countVisibleMapLocations();

    // compare size of business list with map nodes
    expect(businessCardListSize).toBe(locationsSum);
  });
});
