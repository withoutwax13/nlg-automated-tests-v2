import { expect } from "@playwright/test";
import { currentPage } from "../../support/runtime";

const dialogItems = () =>
  currentPage().locator(".k-dialog .k-list-content .k-list-ul .k-list-item");

export const rearrangeColumns = async () => {
  const items = dialogItems();
  const count = await items.count();

  for (let index = 1; index < count; index += 1) {
    const source = items.nth(index);
    const target = items.nth(index - 1);
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) {
      continue;
    }

    await source.dragTo(target);
  }
};

const toggleSwitches = async (
  switchIndex: number,
  isToggleOn: boolean,
  columnIndex: number[],
  offset = 0
) => {
  const items = dialogItems();
  const count = await items.count();

  for (let index = 0; index < count; index += 1) {
    const item = items.nth(index);
    const switchLocator = item.locator('span[role="switch"]').nth(switchIndex);
    const checked = (await switchLocator.getAttribute("aria-checked")) === "true";
    const targetIndex = index + offset;

    if (checked === isToggleOn && columnIndex.includes(targetIndex)) {
      await switchLocator.click();
    }
  }
};

export const freezeColumns = async (isToggleFreeze: boolean, columnIndex: number[]) => {
  await toggleSwitches(1, isToggleFreeze, columnIndex);
};

export const freezeColumnsApproval = async (
  isToggleFreeze: boolean,
  columnIndex: number[]
) => {
  await toggleSwitches(1, isToggleFreeze, columnIndex, 1);
};

export const verifyFreezeColumns = async (enabledColumnCount: number) => {
  const items = dialogItems();
  const count = await items.count();
  let enabledCount = 0;

  for (let index = 0; index < count; index += 1) {
    const switchLocator = items.nth(index).locator('span[role="switch"]').nth(1);
    const checked = (await switchLocator.getAttribute("aria-checked")) === "true";

    if (checked) {
      enabledCount += 1;
      expect(enabledCount).toBeLessThanOrEqual(enabledColumnCount);
    } else {
      await expect(switchLocator).toHaveClass(/k-disabled/);
    }
  }

  expect(enabledCount).toBe(enabledColumnCount);
};

export const hideShowColumns = async (isToggleHide: boolean, columnIndex: number[]) => {
  await toggleSwitches(0, isToggleHide, columnIndex);
};

export const hideShowColumnsApproval = async (
  isToggleHide: boolean,
  columnIndex: number[]
) => {
  await toggleSwitches(0, isToggleHide, columnIndex, 1);
};
