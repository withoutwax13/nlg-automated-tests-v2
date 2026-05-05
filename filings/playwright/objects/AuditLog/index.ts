import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { getRowByCellText } from "../../utils/Grid";

class AuditLog {
  private elements(page: Page = resolvePage()) {
    return {
      columns: () => page.locator("thead tr").nth(0).locator("th"),
      filterRow: () => page.locator("thead tr").nth(1),
      rows: () => page.locator("tbody tr"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async findRowByAction(page: Page = resolvePage(), action: string) {
    return getRowByCellText(this.getElement(page).rows(), 1, action);
  }

  async findRowByRole(page: Page = resolvePage(), role: string) {
    return getRowByCellText(this.getElement(page).rows(), 2, role);
  }

  async findRowByActionTakenBy(page: Page = resolvePage(), actionTakenBy: string) {
    return getRowByCellText(this.getElement(page).rows(), 3, actionTakenBy);
  }

  async findRowByCreatedDate(
    page: Page,
    createdDate: { month: number; day: number; year: number }
  ) {
    const wantedDate = `${createdDate.month}-${createdDate.year}-${createdDate.day}`;
    return getRowByCellText(this.getElement(page).rows(), 4, wantedDate);
  }

  async expandCollapseRow(
    page: Page,
    anchorColumn: string,
    anchorValue: string | { month: number; day: number; year: number }
  ) {
    let row;
    switch (anchorColumn) {
      case "Action":
        row = await this.findRowByAction(page, String(anchorValue));
        break;
      case "Role":
        row = await this.findRowByRole(page, String(anchorValue));
        break;
      case "Action Taken By":
        row = await this.findRowByActionTakenBy(page, String(anchorValue));
        break;
      case "Created Date":
        row = await this.findRowByCreatedDate(
          page,
          anchorValue as { month: number; day: number; year: number }
        );
        break;
      default:
        throw new Error(`Unsupported anchor column: ${anchorColumn}`);
    }

    await row.locator("td").nth(0).locator("a").click();
  }
}

export default AuditLog;
