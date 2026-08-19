import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer, I should only have details and delete as options in my action button column", () => {
  test("Initiating test", { tag: ["@slot-01", "@taxpayer", "@business-active"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessList.init(page);
    const actionButton = await taxpayerBusinessList.getElementOfColumn(
      "Actions",
      "DBA",
      resourceSlot.businesses.active
    );
    await actionButton.click();
    await expect(taxpayerBusinessList.getElement().anyList().filter({ hasText: "View Details" }).first()).toBeVisible();
    await expect(taxpayerBusinessList.getElement().anyList().filter({ hasText: "Remove" }).first()).toBeVisible();
  });
});
