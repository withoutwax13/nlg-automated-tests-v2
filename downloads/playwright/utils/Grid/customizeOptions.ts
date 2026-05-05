import { expect, type Page } from "@playwright/test";

const dialogItems = (page: Page) =>
  page.locator(".k-dialog .k-list-content .k-list-ul .k-list-item");

export const rearrangeColumns = async (page: Page) => {
  const count = await dialogItems(page).count();

  for (let index = 1; index < count; index += 1) {
    const handle = dialogItems(page).nth(index).locator("span").nth(0).locator("i");
    await handle.hover();
  }
};

export const freezeColumns = async (
  page: Page,
  isToggleFreeze: boolean,
  columnIndex: number[]
) => {
  const count = await dialogItems(page).count();

  for (let index = 0; index < count; index += 1) {
    const toggle = dialogItems(page).nth(index).locator("span[role='switch']").last();
    const checked = await toggle.getAttribute("aria-checked");
    if (checked === "true" && isToggleFreeze && columnIndex.includes(index)) {
      await toggle.click();
    }
    if (checked === "false" && !isToggleFreeze && columnIndex.includes(index)) {
      await toggle.click();
    }
  }
};

export const freezeColumnsApproval = async (
  page: Page,
  isToggleFreeze: boolean,
  columnIndex: number[]
) => {
  await freezeColumns(
    page,
    isToggleFreeze,
    columnIndex.map((index) => index - 1)
  );
};

export const verifyFreezeColumns = async (page: Page, enabledColumnCount: number) => {
  const count = await dialogItems(page).count();
  let trueSwitchCount = 0;

  for (let index = 0; index < count; index += 1) {
    const toggle = dialogItems(page).nth(index).locator("span[role='switch']").last();
    const checked = await toggle.getAttribute("aria-checked");
    if (checked === "true") {
      trueSwitchCount += 1;
      expect(trueSwitchCount).toBeLessThanOrEqual(enabledColumnCount);
    } else {
      await expect(toggle).toHaveClass(/k-disabled/);
    }
  }

  expect(trueSwitchCount).toBe(enabledColumnCount);
};

export const hideShowColumns = async (
  page: Page,
  isToggleHide: boolean,
  columnIndex: number[]
) => {
  const count = await dialogItems(page).count();

  for (let index = 0; index < count; index += 1) {
    const toggle = dialogItems(page).nth(index).locator("span[role='switch']").first();
    const checked = await toggle.getAttribute("aria-checked");
    if (checked === "true" && isToggleHide && columnIndex.includes(index)) {
      await toggle.click();
    }
    if (checked === "false" && !isToggleHide && columnIndex.includes(index)) {
      await toggle.click();
    }
  }
};

export const hideShowColumnsApproval = async (
  page: Page,
  isToggleHide: boolean,
  columnIndex: number[]
) => {
  await hideShowColumns(
    page,
    isToggleHide,
    columnIndex.map((index) => index - 1)
  );
};
