import { test } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should be able to see the Map view of the business list", () => {
  test("As a user, I should be able to see the Map view of the business list", { tag: ["@slot-07", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapLoad();
    await agsBusinessGrid.waitForMapNodeLoad();
  });
});
