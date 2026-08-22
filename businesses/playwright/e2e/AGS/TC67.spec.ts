import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, when I reach the bottom of the list, I should be able to see the Back to Top button", () => {
    test("As a user, when I reach the bottom of the list, I should be able to see the Back to Top button", { tag: ["@slot-02", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.scrollBusinessCardListToBottom({ requireBackToTop: true });
        await expect(agsBusinessGrid.getElement().backToTopButton()).toBeVisible();
    });
});
