import { currentPage, listItem, visit, waitForLoading, withText } from "../../support/runtime";
import { getOrderOfColumns, normalizeCellText } from "../../utils/Grid";

class BusinessGrid {
  userType: string;
  municipalitySelection?: string;
  private columnIndexes: Record<string, number> = {};

  constructor(props: { userType: string; municipalitySelection?: string }) {
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    return {
      columns: () => this.page().locator("thead tr th"),
      rows: () => this.page().locator("tbody tr"),
      addBusinessButton: () => this.page().getByText("Add a Business", { exact: false }).first(),
      anyList: () => this.page().locator("li"),
      searchMunicipalityDropdown: () => this.page().locator('input[placeholder="Search government ..."]'),
      toastComponent: () => this.page().locator(".Toastify"),
      clearAllFiltersButton: () => this.page().getByText("Clear All", { exact: false }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  private async ensureColumns() {
    if (Object.keys(this.columnIndexes).length === 0) {
      this.columnIndexes = await getOrderOfColumns(this.elements().columns());
    }
  }

  async init() {
    await visit("/BusinessesApp/BusinessesList");
    await waitForLoading(90);
    if (this.userType === "ags" && this.municipalitySelection) {
      await this.searchMunicipality(this.municipalitySelection);
    }
    await this.ensureColumns();
  }

  async searchMunicipality(municipalityName: string) {
    await this.elements().searchMunicipalityDropdown().fill(municipalityName);
    await listItem(municipalityName).click({ force: true });
    await waitForLoading(90);
    this.columnIndexes = {};
  }

  private async findRowByDba(businessDba: string) {
    await this.ensureColumns();
    const rows = this.elements().rows();
    const count = await rows.count();

    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const value = normalizeCellText(await row.locator("td").nth(this.columnIndexes["DBA"]).textContent());
      if (value === businessDba) {
        return row;
      }
    }

    return undefined;
  }

  async clickAddBusinessButton() {
    await this.elements().addBusinessButton().click({ force: true });
  }

  async viewBusinessDetails(businessDba: string) {
    const row = await this.findRowByDba(businessDba);
    if (!row) {
      throw new Error(`Business not found: ${businessDba}`);
    }
    await row.locator("td").nth(this.columnIndexes["Actions"]).click({ force: true });
    await listItem("View Details").click({ force: true });
  }

  async deleteBusiness(businessDba: string) {
    const row = await this.findRowByDba(businessDba);
    if (!row) {
      throw new Error(`Business not found: ${businessDba}`);
    }
    await row.locator("td").nth(this.columnIndexes["Actions"]).click({ force: true });
    await listItem("Delete").click({ force: true });
    await withText(this.page().locator(".k-dialog-actions button"), "Delete").click({ force: true });
    await waitForLoading();
  }
}

export default BusinessGrid;
