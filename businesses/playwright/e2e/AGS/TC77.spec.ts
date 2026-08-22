import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click a single business on the map, I should be able to see details of it placed on the left side of the map", () => {
  test("As a user, If I click a single business on the map, I should be able to see details of it placed on the left side of the map", { tag: ["@slot-02", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapNodeLoad();

    const isPinInViewport = async (): Promise<boolean> => {
      try {
        await expect(agsBusinessGrid.getElement().mapLocationPins().first()).toBeInViewport({ timeout: 3_000 });
        return true;
      } catch {
        return false;
      }
    };

    // Keep clicking clusters until there are single location pins in the viewport.
    // Bound the attempts so missing or broken map data cannot hang the run indefinitely.
    for (let attempt = 0; attempt < 8 && !(await isPinInViewport()); attempt += 1) {
      const cluster = agsBusinessGrid.getElement().mapLocationClusters().first();
      await expect(cluster).toBeInViewport();
      await cluster.click();
    }

    const pin = agsBusinessGrid.getElement().mapLocationPins().first();
    await expect(pin).toBeInViewport();
    await pin.click();
    await expect(agsBusinessGrid.getElement().mapCardOperationField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardDelinquencyField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardLocationDBAField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardOpenDateField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardOwnerNameField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardOwnerEmailField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardOwnerPhoneField()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardZipCodeField()).toBeInViewport();
  });
});
