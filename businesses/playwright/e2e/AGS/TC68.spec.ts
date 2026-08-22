import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, when I scroll down the first 10 business on the list, the next 10 should load", () => {
    test("As a user, when I scroll down the first 10 business on the list, the next 10 should load", { tag: ["@slot-03", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForBusinessCardListToLoad();
        await agsBusinessGrid.businessCardListLoadNextItems();
        await expect.poll(async () => agsBusinessGrid.getElement().businessCardListButtons().count()).toBeGreaterThanOrEqual(8 * 2);
        await expect.poll(async () => agsBusinessGrid.getElement().businessCardListButtons().count()).toBeLessThanOrEqual(14 * 2);

    });
});
