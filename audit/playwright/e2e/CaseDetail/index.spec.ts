import { expect, Page, test } from "@playwright/test";
import {
  waitForAuditXhr,
  waitForCaseFields,
  waitForUsers,
} from "../../utils/CaseDetails";
import {
  loginViaUi,
  waitForSelectedDepartmentResponse,
} from "../../utils/Login";

type CaseRowData = {
  caseName: string;
  government: string;
  caseType: string;
  assignee: string;
  status: string;
  updatedDate: string;
};

const caseDetailsXpathSelectors = {
  caseType: `//h5[contains(text(), "Case Type")]/parent::span/parent::label//div/span`,
  government: `//h5[contains(text(), "Government")]/parent::span/parent::label//div/span`,
  caseName: `//h5[contains(text(), "Case Name")]/parent::span/parent::label//div/span`,
  assignee: `//h5[contains(text(), "Assignee Name")]/parent::span/parent::label//div/span`,
  status: `//a[@href="/cases"]//button/parent::a/parent::div//div//div[2]`,
};

const normalizeText = (value: string | null | undefined): string => {
  return (value ?? "").replace(/\s+/g, " ").trim();
};

const saveRowData = async (page: Page): Promise<CaseRowData> => {
  const row = page.locator("tbody > tr").first();
  const cells = row.locator("td");

  return {
    caseName: normalizeText(await cells.nth(1).textContent()),
    government: normalizeText(await cells.nth(2).textContent()),
    caseType: normalizeText(await cells.nth(3).textContent()),
    assignee: normalizeText(await cells.nth(4).textContent()),
    status: normalizeText(await cells.nth(5).textContent()),
    updatedDate: normalizeText(await cells.nth(6).textContent()),
  };
};

const assertCaseDetails = async (page: Page, data: CaseRowData): Promise<void> => {
  for (const [key, xpathSelector] of Object.entries(caseDetailsXpathSelectors)) {
    const locator = page.locator(`xpath=${xpathSelector}`).first();
    await expect(locator).toBeVisible();

    const detailText = normalizeText(await locator.textContent());
    const rowText = data[key as keyof typeof caseDetailsXpathSelectors];

    expect(detailText.toLowerCase()).toContain(rowText.toLowerCase());
  }

  const activityHistoryTab = page
    .locator('xpath=//span[contains(text(),"Activity History")]')
    .first();
  await expect(activityHistoryTab).toBeVisible();
  await activityHistoryTab.click();

  await expect(page.locator("td", { hasText: data.updatedDate }).first()).toBeVisible();
};

test.describe("Case Detail Scenarios", () => {
  test("As a user, I should be able to see that the column data in /cases grid are similar to the data in the /cases/{id}/info page", async ({ page }) => {
    await loginViaUi(page, { kind: "valid" });
    await expect(page).toHaveURL(/\/cases/);

    const rowData = await saveRowData(page);

    const auditXhrResponse = waitForAuditXhr(page);
    const caseFieldsResponse = waitForCaseFields(page);
    const usersResponse = waitForUsers(page);
    const selectedDepartmentResponse = waitForSelectedDepartmentResponse(page);

    await page.locator("tbody > tr").first().click();

    await Promise.all([
      auditXhrResponse,
      caseFieldsResponse,
      usersResponse,
      selectedDepartmentResponse,
    ]);

    await expect(page).toHaveURL(/\/cases\/.+\/info/);
    await assertCaseDetails(page, rowData);
  });
});
