import { expect, test } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, When the Legend > Operating Status is selected I should be able to use the options to filter the data displayed on map", () => {
  test("As a user, When the Legend > Operating Status is selected I should be able to use the options to filter the data displayed on map", { tag: ["@slot-09", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForMapNodeLoad();

    await agsBusinessGrid.clickMapLegendButton();
    await agsBusinessGrid.clickOperatingStatusLegendButton();

    const statusCheckboxes = [
      { status: "Active", checkbox: agsBusinessGrid.getElement().legendCheckboxActive() },
      { status: "Active/Seasonal", checkbox: agsBusinessGrid.getElement().legendCheckboxActiveSeasonal() },
      { status: "Inactive", checkbox: agsBusinessGrid.getElement().legendCheckboxInactive() },
      { status: "Closed", checkbox: agsBusinessGrid.getElement().legendCheckboxClosed() },
      { status: "Sold", checkbox: agsBusinessGrid.getElement().legendCheckboxSold() },
    ];

    for (const { checkbox } of statusCheckboxes) {
      await checkbox.uncheck();
    }

    await expect(agsBusinessGrid.getElement().businessCardListButtons()).toHaveCount(0);
    await expect
      .poll(() => agsBusinessGrid.countVisibleMapLocations(), { timeout: 30_000 })
      .toBe(0);

    for (const { status, checkbox } of statusCheckboxes) {
      await checkbox.check();
      await agsBusinessGrid.scrollBusinessCardListToBottom();

      const shownStatuses = await agsBusinessGrid
        .getElement()
        .businessCardListStatuses()
        .allInnerTexts();
      if (shownStatuses.length === 0) {
        await expect(agsBusinessGrid.getElement().noMapBusinessesMessage()).toBeVisible();
        await expect
          .poll(() => agsBusinessGrid.countVisibleMapLocations(), { timeout: 30_000 })
          .toBe(0);
      } else {
        expect(
          shownStatuses.every((shownStatus) => shownStatus.trim() === status),
          `Expected every visible business to have status ${status}; found ${shownStatuses.join(", ")}.`,
        ).toBe(true);
      }

      await checkbox.uncheck();
      await expect(agsBusinessGrid.getElement().businessCardListButtons()).toHaveCount(0);
    }
  });
});
