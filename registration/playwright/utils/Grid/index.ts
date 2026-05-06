import type { Locator, Page } from "@playwright/test";

export const normalizeCellText = (value: string | null | undefined): string =>
  (value || "").replace(/\s+/g, " ").trim();

export const getOrderOfColumns = async (columns: Locator) => {
  const values = await columns.evaluateAll((elements) =>
    elements.map((element, index) => [
      (element.textContent || "").replace(/\s+/g, " ").trim(),
      index,
    ])
  );

  return Object.fromEntries(values.filter(([name]) => Boolean(name)));
};

export const validateFilterOperation = (
  filterType: "text" | "date" | "number",
  filterOperation: string
) => {
  const validFilterOperations: Record<string, string[]> = {
    text: [
      "Contains",
      "Is equal to",
      "Starts with",
      "Ends with",
      "Is null",
      "Is not null",
    ],
    date: [
      "Is equal to",
      "Is after or equal to",
      "Is after",
      "Is before",
      "Is before or equal to",
    ],
    number: [
      "Is equal to",
      "Is greater than",
      "Is greater than or equal to",
      "Is less than",
      "Is less than or equal to",
    ],
  };

  if (!validFilterOperations[filterType].includes(filterOperation)) {
    throw new Error(`Invalid ${filterType} filter operation: ${filterOperation}`);
  }
};


export const applyGridFilter = async ({
  page,
  filterButton,
  filterType,
  filterValue,
  filterOperation,
}: {
  page: Page;
  filterButton: Locator;
  filterType: string;
  filterValue: string;
  filterOperation: string;
}) => {
  await filterButton.click({ force: true });

  if (filterType === "multi-select") {
    const row = page
      .locator(".k-multicheck-wrap li")
      .filter({ hasText: filterValue })
      .first();
    await row.locator('input[type="checkbox"]').click({ force: true });
  } else {
    if (filterType === "text" || filterType === "date" || filterType === "number") {
      validateFilterOperation(filterType as "text" | "date" | "number", filterOperation);
    }

    await page.locator(".k-filter-menu-container .k-dropdownlist").click({ force: true });
    await page
      .locator(".k-list-ul li .k-list-item-text")
      .filter({ hasText: filterOperation })
      .first()
      .click({ force: true });

    if (!["Is not null", "Is null"].includes(filterOperation)) {
      if (filterType === "date") {
        const dateInput = page.locator(".k-filter-menu-container .k-dateinput input").first();
        await dateInput.fill("");
        await dateInput.type(filterValue.split("/").join("ArrowRight"), { delay: 10 });
      } else {
        await page.locator(".k-filter-menu-container .k-input").fill(filterValue);
      }
    }
  }

  await page
    .locator(".k-filter-menu-container .k-actions .k-button")
    .filter({ hasText: "Filter" })
    .click({ force: true });
};
