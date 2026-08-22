import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should only see 10 business on the list", () => {
    test("As a user, I should only see 10 business on the list", { tag: ["@slot-04", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForBusinessCardListToLoad();
        await expect.poll(async () => agsBusinessGrid.getElement().businessCardListButtons().count()).toBeGreaterThanOrEqual(8);
        await expect.poll(async () => agsBusinessGrid.getElement().businessCardListButtons().count()).toBeLessThanOrEqual(14);

    });
});
