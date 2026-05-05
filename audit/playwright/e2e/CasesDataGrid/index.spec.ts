import { expect, Page, test } from "@playwright/test";
import { login, waitForSearchResults } from "../../support/native-helpers";

const searchInput = 'input[placeholder="Search..."]';

const loginAndSearch = async (page: Page, searchTerm: string) => {
  await login(page);
  await page.locator(searchInput).fill(searchTerm);
  await waitForSearchResults(page);

  const rows = page.locator("tbody > tr");
  const count = await rows.count();
  for (let rowIndex = 0; rowIndex < count; rowIndex++) {
    const caseName = (
      await rows.nth(rowIndex).locator("td").nth(1).innerText()
    )
      .toLowerCase()
      .trim();
    expect(caseName).toContain(searchTerm.toLowerCase());
  }
};

const collectColumnValues = async (page: Page, columnIndex: number): Promise<string[]> => {
  const values: string[] = [];
  const rows = page.locator("tbody tr");
  const rowCount = await rows.count();
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    values.push(await rows.nth(rowIndex).locator("td").nth(columnIndex).innerText());
  }
  return values;
};

const sortAndCollectCases = async (page: Page, columnIndex: number) => {
  await page.locator("tr").locator("th").nth(columnIndex).click();
  await waitForSearchResults(page);
  const ascendingCases = await collectColumnValues(page, columnIndex);

  await page.locator("tr").locator("th").nth(columnIndex).click();
  await waitForSearchResults(page);
  const descendingCases = await collectColumnValues(page, columnIndex);

  return { ascendingCases, descendingCases };
};

const verifySorting = (ascendingCases: string[], descendingCases: string[]) => {
  for (let index = 0; index < ascendingCases.length; index++) {
    expect(ascendingCases[index]).toBe(
      descendingCases[descendingCases.length - 1 - index]
    );
  }
};

test.describe("Data Grid Scenarios", () => {
  test("As a user, I should be able to view the data grid", async ({ page }) => {
    const columnHeaders = [
      "Case Name",
      "Government",
      "Case Type",
      "Assignee",
      "Status",
      "Last Updated",
    ];

    await login(page);

    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("thead tr th")).toHaveCount(8);

    for (let headerIndex = 0; headerIndex < columnHeaders.length; headerIndex++) {
      await expect(page.locator("thead tr th").nth(headerIndex + 1)).toContainText(
        columnHeaders[headerIndex]
      );
    }

    await expect(page.locator("tbody")).toBeVisible();
  });

  test("As a user, I should be able to search the data grid", async ({ page }) => {
    const searchItems = [
      "dwight",
      "creve",
      "sales tax",
      "danny",
      "not started",
      "2024-03-05",
    ];

    await login(page);

    for (let index = 0; index < searchItems.length; index++) {
      const searchItem = searchItems[index];
      await page.locator(searchInput).fill(searchItem);
      await waitForSearchResults(page);

      const rows = page.locator("tbody > tr");
      const count = await rows.count();
      for (let rowIndex = 0; rowIndex < count; rowIndex++) {
        const cellText = (
          await rows.nth(rowIndex).locator("td").nth(index + 1).innerText()
        ).toLowerCase();
        expect(cellText).toContain(searchItem);
      }

      await page.locator(searchInput).clear();
    }
  });

  const sortTests = [
    { description: "Case Name", columnIndex: 1 },
    { description: "Government", columnIndex: 2 },
    { description: "Case Type", columnIndex: 3 },
    { description: "Assignee", columnIndex: 4 },
    { description: "Status", columnIndex: 5 },
  ];

  for (const { description, columnIndex } of sortTests) {
    test(`As a user, I should be able to sort the data grid by ${description}`, async ({ page }) => {
      await loginAndSearch(page, "dwight");
      const { ascendingCases, descendingCases } = await sortAndCollectCases(page, columnIndex);
      verifySorting(ascendingCases, descendingCases);
    });
  }

  test("As a user, I should see different colors on each status data", async ({ page }) => {
    const status = [
      { name: "not started", color: "rgb(215, 86, 72)" },
      { name: "audit onboarding", color: "rgb(246, 189, 69)" },
      { name: "customer onboarding", color: "rgb(246, 189, 69)" },
      { name: "loa signed", color: "rgb(246, 189, 69)" },
      { name: "audit notice sent", color: "rgb(246, 189, 69)" },
      { name: "provider data received", color: "rgb(246, 189, 69)" },
      { name: "nda signed and sent", color: "rgb(246, 189, 69)" },
      { name: "audit complete", color: "rgb(85, 153, 112)" },
    ];

    await login(page);

    for (const item of status) {
      await page.locator(searchInput).clear();
      await page.locator(searchInput).fill(item.name);
      await waitForSearchResults(page);

      const rows = page.locator("tbody > tr");
      const count = await rows.count();
      for (let rowIndex = 0; rowIndex < count; rowIndex++) {
        const row = rows.nth(rowIndex);
        const statusText = (
          await row.locator("td").nth(5).innerText()
        ).toLowerCase();
        expect(statusText).toContain(item.name);
        await expect(row.locator("td").nth(5).locator("p")).toHaveCSS(
          "color",
          item.color
        );
      }
    }
  });
});
