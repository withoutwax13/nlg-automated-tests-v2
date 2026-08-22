import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, When I or the system zoom in the map, the list should change so that it would only display the businesses I see on the map", () => {
  test("As a user, When I or the system zoom in the map, the list should change so that it would only display the businesses I see on the map", { tag: ["@slot-01", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapNodeLoad();

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
