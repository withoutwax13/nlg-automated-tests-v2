import { expect, Page, test } from "@playwright/test";
import CaseDetails from "../../utils/CaseDetails";
import Login from "../../utils/Login";
import { expectPathname, login } from "../../support/native-helpers";

type RowData = {
  caseName: string;
  government: string;
  caseType: string;
  assignee: string;
  status: string;
  updatedDate: string;
};

const caseDetailsXpathSelectors = {
  caseInfo: {
    caseType:
      '//h5[contains(text(), "Case Type")]/parent::span/parent::label//div/span',
    government:
      '//h5[contains(text(), "Government")]/parent::span/parent::label//div/span',
    caseName:
      '//h5[contains(text(), "Case Name")]/parent::span/parent::label//div/span',
    assignee:
      '//h5[contains(text(), "Assignee Name")]/parent::span/parent::label//div/span',
    status: '//a[@href="/cases"]//button/parent::a/parent::div//div//div[2]',
  },
};

const saveRowData = async (page: Page): Promise<RowData> => {
  const row = page.locator("tbody > tr").first();
  const columns = ["caseName", "government", "caseType", "assignee", "status", "updatedDate"] as const;

  const data = {} as RowData;
  for (let index = 0; index < columns.length; index++) {
    data[columns[index]] = await row.locator("td").nth(index + 1).innerText();
  }

  return data;
};

const assertCaseDetails = async (page: Page, data: RowData) => {
  for (const key of Object.keys(caseDetailsXpathSelectors.caseInfo) as Array<keyof typeof caseDetailsXpathSelectors.caseInfo>) {
    const text = await page
      .locator(`xpath=${caseDetailsXpathSelectors.caseInfo[key]}`)
      .innerText();
    expect(text.trim()).toBe(data[key].trim());
  }

  const activityHistoryTab = page.locator('xpath=//span[contains(text(),"Activity History")]');
  await expect(activityHistoryTab).toBeVisible();
  await activityHistoryTab.click();

  await expect(
    page.locator(`xpath=//td[contains(text(),"${data.updatedDate.trim()}")]`)
  ).toBeVisible();
};

test.describe("Case Detail Scenarios", () => {
  test("As a user, I should be able to see that the column data in /cases grid are similar to the data in the /cases/{id}/info page", async ({ page }) => {
    await Login.login(page);
    await expectPathname(page, /\/cases/);

    const rowData = await saveRowData(page);

    const auditWaiter = CaseDetails.interceptAuditXhr(page);
    const fieldsWaiter = CaseDetails.interceptCaseFields(page);
    const usersWaiter = CaseDetails.interceptUsers(page);
    const selectedDepartmentWaiter = Login.interceptSelectedDepartment(page);

    await page.locator("tbody > tr").first().click();

    await CaseDetails.waitForAuditXhr(auditWaiter);
    await CaseDetails.waitForCaseFields(fieldsWaiter);
    await CaseDetails.waitForUsers(usersWaiter);
    await Login.waitForSelectedDepartment(selectedDepartmentWaiter);

    await expectPathname(page, /\/cases\//);
    await expect(page).toHaveURL(/\/info/);

    await assertCaseDetails(page, rowData);
  });
});
