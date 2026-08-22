import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click a specific business on the business card list, the details should display on the left side of the map", () => {
  test("As a user, If I click a specific business on the business card list, the details should display on the left side of the map", { tag: ["@slot-03", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForBusinessCardListToLoad();

    const businessAddress = await agsBusinessGrid
      .getElement()
      .businessCardListAddresses()
      .first()
      .innerText();
    await agsBusinessGrid.getElement().businessCardListButtons().first().click();
    await expect(agsBusinessGrid.getElement().mapCardViewLessButton()).toBeInViewport();
    await expect(agsBusinessGrid.getElement().mapCardDescription()).toContainText(businessAddress);
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
