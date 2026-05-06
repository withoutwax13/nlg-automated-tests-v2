import { expect, test } from "@playwright/test";
import SettlementGrid from "../../../objects/SettlementGrid";
import Login from "../../../utils/Login";

const nineMonthsFromToday = () => {
  const today = new Date();
  today.setMonth(today.getMonth() - 9);
  return {
    month: today.getMonth() + 1,
    day: today.getDate(),
    year: today.getFullYear(),
  };
};

test.describe(
  "As an municipal user, I should be able to generate a distribution details from a date range",
  { tag: ["regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const settlementGrid = new SettlementGrid(page, {
        userType: "municipal",
      });

      await Login.login(page, { accountType: "municipal", accountIndex: 5 });
      await settlementGrid.init();
      await expect(settlementGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
      const defaultTotalItems = await settlementGrid.getTotalItems();
      await settlementGrid.setStartDate(nineMonthsFromToday());
      await expect(settlementGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
      const newTotalItems = await settlementGrid.getTotalItems();
      expect(defaultTotalItems).not.toBe(newTotalItems);
    });
  }
);
