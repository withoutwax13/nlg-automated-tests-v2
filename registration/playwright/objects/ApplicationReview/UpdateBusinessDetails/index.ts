import { type Page } from "@playwright/test";
import { waitForLoading } from "../../../support/native-helpers";
import UpdateBusinessList from "./UpdateBusinessList";
import ViewLocationDetails from "./ViewLocationDetails";

class UpdateBusinessDetails {
  updateBusinessList: UpdateBusinessList;
  viewLocationDetailsModal: ViewLocationDetails;

  constructor(private readonly page: Page) {
    this.updateBusinessList = new UpdateBusinessList(page);
    this.viewLocationDetailsModal = new ViewLocationDetails(page);
  }

  private elements() {
    return {
      editBusinessDetailsButton: () => this.page.locator(".NLGButtonSecondaryDanger, button").filter({ hasText: /Update Details|Edit Business Details/ }).first(),
      locationRows: () => this.page.locator("tr, section, div"),
      viewDetailsLink: (locationAddress: string) =>
        this.page.locator("tr, div").filter({ hasText: locationAddress }).locator("button, a").filter({ hasText: /View|Details/ }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickEditBusinessDetailsButton() {
    await this.getElements().editBusinessDetailsButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async viewLocationDetails(locationAddress: string) {
    await this.getElements().viewDetailsLink(locationAddress).click({ force: true });
    await waitForLoading(this.page, 2);
  }
}

export default UpdateBusinessDetails;
