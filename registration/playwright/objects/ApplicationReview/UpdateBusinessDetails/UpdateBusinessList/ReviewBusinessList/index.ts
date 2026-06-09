import { expect, type Page } from "@playwright/test";
import { waitForLoading } from "../../../../../support/native-helpers";

class ReviewBusinessList {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      linkExistingBusinessToggle: () => this.page.locator(".review-section-title, button, label").filter({ hasText: "Link Existing Business" }).first(),
      linkExistingComponent: () => this.page.locator("span, div").filter({ hasText: "You have linked similar business location:" }).first(),
      undoLinkingButton: () => this.page.locator("a, button").filter({ hasText: /Undo|unlink/i }).first(),
      updateLinkBusinessButton: () => this.page.locator(".NLGButtonPrimary, button").filter({ hasText: /Link Business|Update Linked Business/ }).first(),
      linkBusinessLocationDropdown: () => this.page.locator('input[placeholder="Search by DBA, Legal Business Name, Location Address 1, or Location Address 2"]').first(),
      proceedWithoutLinkingButton: () => this.page.locator(".NLGButtonSecondary, button").filter({ hasText: "Proceed without linking" }).first(),
      updateAddBusinessButton: () => this.page.locator(".NLGButtonPrimary, button").filter({ hasText: /Add Business|Update Business Details/ }).first(),
      similarBusinessLocationList: () => this.page.locator("label").filter({ hasText: "Similar Business Locations" }).first().locator("xpath=following::label"),
      anyList: () => this.page.locator("li"),
    };
  }

  getElements() {
    return this.elements();
  }

  async disregardSimilarBusinessRecords() {
    if (await this.getElements().proceedWithoutLinkingButton().isVisible().catch(() => false)) {
      await this.getElements().proceedWithoutLinkingButton().click({ force: true });
      await waitForLoading(this.page, 2);
    }
  }

  async clicUpdateAddBusinessDetailsButton() {
    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          response.url().includes("/businesses/"),
        { timeout: 15000 }
      )
      .catch(() => null);
    await this.getElements().updateAddBusinessButton().scrollIntoViewIfNeeded();
    await expect(this.getElements().updateAddBusinessButton()).toBeEnabled();
    await this.getElements().updateAddBusinessButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 10);
  }

  async toggleLinkExistingBusiness() {
    await this.getElements().linkExistingBusinessToggle().click({ force: true });
    await waitForLoading(this.page, 1);
  }

  async selectBusinessLocationToLink(businessSearch: string) {
    await this.getElements().linkBusinessLocationDropdown().fill(businessSearch);
    await this.getElements().anyList().filter({ hasText: businessSearch }).first().click({ force: true });
  }

  async clickLinkUpdateLinkedBusinessButton() {
    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          response.url().includes("/businesses/"),
        { timeout: 15000 }
      )
      .catch(() => null);
    await this.getElements().updateLinkBusinessButton().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async clickUndoLinkingButton() {
    await this.getElements().undoLinkingButton().click({ force: true });
    await waitForLoading(this.page, 2);
  }
}

export default ReviewBusinessList;
