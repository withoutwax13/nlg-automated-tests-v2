import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, when I click the Back to Top button, the list should go back to the first business on the list", () => {
    test("As a user, when I click the Back to Top button, the list should go back to the first business on the list", { tag: ["@slot-01", "@ags"] }, async ({ page, resourceSlot }) => {
        const agsBusinessGrid = new BusinessGrid({
            userType: "ags",
            municipalitySelection: resourceSlot.municipality,
        });
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.scrollBusinessCardListToBottom({ requireBackToTop: true });
        await agsBusinessGrid.getElement().backToTopButton().click();
        await expect(agsBusinessGrid.getElement().businessCardListButtons().first()).toBeInViewport({ratio: 1});
    });
});
