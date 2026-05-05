import { expect, Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";

const getItems = (page: Page = resolvePage()) =>
  page.locator(".k-dialog .k-list-content .k-list-ul .k-list-item");

export const rearrangeColumns = async (_page: Page = resolvePage()) => {
  // Intentionally left minimal until a native drag-and-drop helper is required.
};

const toggleSwitches = async (
  page: Page = resolvePage(),
  columnIndex: number[],
  switchIndex: 0 | 1,
  shouldEnable: boolean,
  offset = 0
) => {
  const items = getItems(page);
  const count = await items.count();
  for (let index = 0; index < count; index += 1) {
    if (!columnIndex.includes(index + offset)) {
      continue;
    }
    const toggle = items.nth(index).locator("span[role='switch']").nth(switchIndex);
    const checked = await toggle.getAttribute("aria-checked");
    if ((shouldEnable && checked === "false") || (!shouldEnable && checked === "true")) {
      await toggle.click();
    }
  }
};

export const freezeColumns = async (
  isToggleFreeze: boolean,
  columnIndex: number[],
  page: Page = resolvePage()
) => toggleSwitches(page, columnIndex, 1, !isToggleFreeze, 0);

export const freezeColumnsApproval = async (
  isToggleFreeze: boolean,
  columnIndex: number[],
  page: Page = resolvePage()
) => toggleSwitches(page, columnIndex, 1, !isToggleFreeze, 1);

export const verifyFreezeColumns = async (
  enabledColumnCount: number,
  page: Page = resolvePage()
) => {
  const items = getItems(page);
  const toggles = items.locator("span[role='switch']").nth(1);
  let enabledCount = 0;
  const count = await items.count();
  for (let index = 0; index < count; index += 1) {
    const checked = await items.nth(index).locator("span[role='switch']").last().getAttribute("aria-checked");
    if (checked === "true") {
      enabledCount += 1;
    }
  }
  expect(enabledCount).toBe(enabledColumnCount);
};

export const hideShowColumns = async (
  isToggleHide: boolean,
  columnIndex: number[],
  page: Page = resolvePage()
) => toggleSwitches(page, columnIndex, 0, !isToggleHide, 0);

export const hideShowColumnsApproval = async (
  isToggleHide: boolean,
  columnIndex: number[],
  page: Page = resolvePage()
) => toggleSwitches(page, columnIndex, 0, !isToggleHide, 1);
