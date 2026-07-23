import { type Locator, type Page } from "@playwright/test";
import { normalizeText, waitForLoading } from "../../support/native-helpers";

class AuditLog {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      cells: (row: Locator) => row.locator("td"),
      expandCollapseButton: (row: Locator) =>
        row.locator("button, a, i").filter({ hasText: /expand|collapse/i }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async findRowByAction(action: string) {
    return this.findRowByText(action);
  }

  async findRowByRole(role: string) {
    return this.findRowByText(role);
  }

  async findRowByActionTakenBy(actionTakenBy: string) {
    return this.findRowByText(actionTakenBy);
  }

  async findRowByCreatedDate(createdDate: string) {
    return this.findRowByText(createdDate);
  }

  async expandCollapseRow(anchorText: string) {
    const row = await this.findRowByText(anchorText);
    const button = this.getElement().expandCollapseButton(row);
    if (await button.count()) {
      await button.click({ force: true });
    } else {
      await row.click({ force: true });
    }
    await waitForLoading(this.page, 1);
  }

  private async findRowByText(text: string): Promise<Locator> {
    const row = this.getElement().rows().filter({ hasText: text }).first();
    if (await row.count()) return row;

    const rows = this.getElement().rows();
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const candidate = rows.nth(index);
      if (normalizeText(await candidate.textContent()).includes(text)) return candidate;
    }

    throw new Error(`Audit log row not found for: ${text}`);
  }
}

export default AuditLog;
