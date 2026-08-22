import { test, expect } from "../../fixtures/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, If I click the Open on the details of a selected business, the system should open on a new link tab the Business Details page for the selected business", () => {
    test("As a user, If I click the Open on the details of a selected business, the system should open on a new link tab the Business Details page for the selected business", { tag: ["@slot-07", "@ags"] }, async ({page, context, resourceSlot}) => {
        const agsBusinessGrid = new BusinessGrid({userType: "ags", municipalitySelection: resourceSlot.municipality})
        await Login.login(page, resourceSlot, { accountType: "ags" });
        await agsBusinessGrid.init(page);
        await agsBusinessGrid.clickMapViewRadio();
        await agsBusinessGrid.waitForMapNodeLoad();
        await agsBusinessGrid.getElement().businessCardListButtons().first().click()

        const mapBusinessName = await agsBusinessGrid
            .getElement()
            .fullInfoCard()
            .getByRole("heading")
            .innerText();
        const mapBusinessDescription = await agsBusinessGrid.getElement().mapCardDescription().innerText();
        const newPagePromise = context.waitForEvent('page');
        await expect(agsBusinessGrid.getElement().mapCardOperationField()).toBeInViewport();

        await agsBusinessGrid.clickMapCardOpenButton()
        const newPage = await newPagePromise
        await newPage.waitForLoadState("domcontentloaded");

        await expect(newPage).toHaveURL(/\/BusinessesApp\/BusinessDetails\//)
        await expect(newPage.getByRole("heading", {name: "Business Details"})).toBeInViewport();

        const detailsBusinessName = newPage
            .getByText("Legal Business Name", { exact: true })
            .locator("xpath=following-sibling::*[1]");
        const detailsAddress = newPage
            .getByText("Location Address 1", { exact: true })
            .locator("xpath=following-sibling::*[1]");

        await expect(detailsBusinessName).toContainText(mapBusinessName);
        await expect(detailsAddress).not.toHaveText("");
        const detailsAddressText = (await detailsAddress.innerText()).replace(/\s+/g, " ").trim();
        expect(mapBusinessDescription.replace(/\s+/g, " ")).toContain(detailsAddressText);
    })
})
