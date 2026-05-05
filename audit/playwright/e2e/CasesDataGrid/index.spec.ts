import { expect, Page, test } from "@playwright/test";
import { loginViaUi } from "../../utils/Login";

const waitForSearchResults = async (page: Page): Promise<void> => {
  const searchResponse = await page.waitForResponse((response) => {
    return (
      response.request().method() === "GET" &&
      /https:\/\/audit\.api\.localgov\.org\/v1\/audits\?.*keyword=/.test(
        response.url()
      )
    );
  });

  expect(searchResponse.status()).toBe(200);
  await page.waitForTimeout(300);
};

const runSearch = async (page: Page, searchTerm: string): Promise<void> => {
  const searchInput = page.locator('input[placeholder="Search..."]');
  const waitForSearch = waitForSearchResults(page);
  await searchInput.fill(searchTerm);
  await waitForSearch;
};

const collectColumnValues = async (
  page: Page,
  columnIndex: number
): Promise<string[]> => {
  const rows = page.locator("tbody > tr");
  const rowCount = await rows.count();
  const values: string[] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const value = await rows
      .nth(rowIndex)
      .locator("td")
      .nth(columnIndex)
      .textContent();

    values.push((value ?? "").trim());
  }

  return values;
};

const sortAndCollectCases = async (
  page: Page,
  columnIndex: number
): Promise<{ ascendingCases: string[]; descendingCases: string[] }> => {
  const columnHeader = page.locator("tr").first().locator("th").nth(columnIndex);

  const waitForAscendingSort = waitForSearchResults(page);
  await columnHeader.click();
  await waitForAscendingSort;
  const ascendingCases = await collectColumnValues(page, columnIndex);

  const waitForDescendingSort = waitForSearchResults(page);
  await columnHeader.click();
  await waitForDescendingSort;
  const descendingCases = await collectColumnValues(page, columnIndex);

  return { ascendingCases, descendingCases };
};

const verifySorting = (
  ascendingCases: string[],
  descendingCases: string[]
): void => {
  expect(ascendingCases.length).toBe(descendingCases.length);

  for (let index = 0; index < ascendingCases.length; index += 1) {
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

    await loginViaUi(page, { kind: "valid" });

    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("thead tr th")).toHaveCount(8);

    for (let headerIndex = 0; headerIndex < columnHeaders.length; headerIndex += 1) {
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

    await loginViaUi(page, { kind: "valid" });

    for (let index = 0; index < searchItems.length; index += 1) {
      const searchItem = searchItems[index];
      await runSearch(page, searchItem);

      const rows = page.locator("tbody > tr");
      const rowCount = await rows.count();

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        const cellText = await rows
          .nth(rowIndex)
          .locator("td")
          .nth(index + 1)
          .textContent();

        expect((cellText ?? "").toLowerCase()).toContain(searchItem.toLowerCase());
      }

      await page.locator('input[placeholder="Search..."]').fill("");
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
      await loginViaUi(page, { kind: "valid" });
      await runSearch(page, "dwight");

      const { ascendingCases, descendingCases } = await sortAndCollectCases(
        page,
        columnIndex
      );

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

    await loginViaUi(page, { kind: "valid" });

    for (const statusItem of status) {
      await runSearch(page, statusItem.name);

      const rows = page.locator("tbody > tr");
      const rowCount = await rows.count();

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        const statusCell = rows.nth(rowIndex).locator("td").nth(5);
        const statusText = await statusCell.textContent();

        expect((statusText ?? "").toLowerCase()).toContain(statusItem.name);
        await expect(statusCell.locator("p").first()).toHaveCSS(
          "color",
          statusItem.color
        );
      }
    }
  });
});
