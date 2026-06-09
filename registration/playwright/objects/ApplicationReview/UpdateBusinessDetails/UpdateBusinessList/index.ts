import { type Page } from "@playwright/test";
import { waitForLoading } from "../../../../support/native-helpers";
import FormRequirements from "./FormRequirements";
import ReviewBusinessList from "./ReviewBusinessList";

class UpdateBusinessList {
  reviewBusinessListModal: ReviewBusinessList;
  formRequirementsModal: FormRequirements;

  constructor(private readonly page: Page) {
    this.reviewBusinessListModal = new ReviewBusinessList(page);
    this.formRequirementsModal = new FormRequirements(page);
  }

  private elements() {
    return {
      reviewBusinessButton: () => this.page.locator("button").filter({ hasText: "Update Details" }),
      updateFormRequirementsButton: () => this.page.locator("button").filter({ hasText: /Update Settings|Set Settings/ }),
      locationsUpdatedCounter: () => this.page.locator("b").filter({ hasText: "Locations Updated" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickReviewBusinessButton(locationAddress: string) {
    const row = this.page.locator("tr, div").filter({ hasText: locationAddress }).filter({ has: this.page.locator("button") }).first();
    const button = row.locator("button").filter({ hasText: "Update Details" }).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click({ force: true });
      await waitForLoading(this.page, 3);
    }
  }

  async clickUpdateFormRequirements(locationAddress: string) {
    const row = this.page.locator("tr, div").filter({ hasText: locationAddress }).filter({ has: this.page.locator("button") }).first();
    const rowButton = row.locator("button").filter({ hasText: /Update Settings|Set Settings/ }).first();
    if (await rowButton.isVisible().catch(() => false)) {
      await rowButton.click({ force: true });
    } else {
      await this.getElements().updateFormRequirementsButton().first().click({ force: true });
    }
    await waitForLoading(this.page, 2);
  }
}

export default UpdateBusinessList;
