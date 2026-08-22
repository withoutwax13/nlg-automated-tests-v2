import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click the cluster of business (numbered circle on the map) I should see the map zooming in on the area of the cluster", () => {
  test("As a user, If I click the cluster of business (numbered circle on the map) I should see the map zooming in on the area of the cluster", { tag: ["@slot-00", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapNodeLoad();

    // Clicks a cluster, and asserts that the number of visible map locations is less than before, but greater than
    // or equal to the value that was in the cluster. That will signify a zoom in. Also check map scale guide before and after.
    // Map scale example: <10 km per 78 pixels>
    const prevMapScale = await agsBusinessGrid.getMapScale();
    const prevCount = await agsBusinessGrid.countVisibleMapLocations();

    const cluster = agsBusinessGrid.getElement().mapLocationClusters().first();
    await expect(cluster).toBeVisible();
    const clusterValue = Number.parseInt(await cluster.innerText(), 10);
    expect(clusterValue).toBeGreaterThan(0);

    await cluster.click();

    await expect
      .poll(async () =>
        agsBusinessGrid.compareDistances(prevMapScale, await agsBusinessGrid.getMapScale()),
      )
      .toBe(true);

    // assert that the zoomed in map has less nodes than it originally had
    await expect.poll(() => agsBusinessGrid.countVisibleMapLocations(), { timeout: 50_000 }).toBeLessThanOrEqual(prevCount);
    // assert that the zoomed in map has >= nodes than was listed in the clicked cluster
    await expect.poll(() => agsBusinessGrid.countVisibleMapLocations(), { timeout: 50_000 }).toBeGreaterThanOrEqual(clusterValue);
  });
});
