import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click the Zoom In on the details of a selected business, it should zoom the map to the exact pin and building of the business", () => {
    test("As a user, If I click the Zoom In on the details of a selected business, it should zoom the map to the exact pin and building of the business", { tag: ["@slot-04", "@ags"] }, async ({page, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();

        const areTherePinsVisible = async () : Promise<boolean> => {
            try {
                await expect(agsBusinessGrid.getElement().mapLocationPins().first()).toBeInViewport({timeout: 3_000})
                return true
            } catch (err) {
                return false;
            }
        }
        // Bound cluster expansion so broken or missing map data cannot hang the worker.
        for (let attempt = 0; attempt < 8 && !(await areTherePinsVisible()); attempt += 1) {
            const cluster = agsBusinessGrid.getElement().mapLocationClusters().first();
            await expect(cluster).toBeInViewport();
            await cluster.click();
        }

        const pin = agsBusinessGrid.getElement().mapLocationPins().first();
        await expect(pin).toBeInViewport();
        await pin.click();

        // verify business details displayed on left side of map
        await expect(agsBusinessGrid.getElement().mapCardOperationField()).toBeInViewport();
        // await expect(municipalBusinessGrid.getElement().businessCardList()).toHaveCount(1);
        // await expect(municipalBusinessGrid.getElement().businessCardList().getByText("TX")).toBeVisible()
        const scaleBefore = await agsBusinessGrid.getMapScale();
        await agsBusinessGrid.clickCardZoomInButton()
        // check that map scale is smaller than before (this is the expected behavior when zoomed in)
        await expect.poll(async () => agsBusinessGrid.compareDistances(scaleBefore, await agsBusinessGrid.getMapScale())).toBe(true);
    })
})
