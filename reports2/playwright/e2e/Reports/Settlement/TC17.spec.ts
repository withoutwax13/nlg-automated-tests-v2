import { test, expect } from '../../../support/pwtest';
import SettlementGrid from "../../../objects/SettlementGrid";

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
  { tags: ["regression"] },
  () => {
    test("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
        userType: "municipal",
      });
      pw.login({ accountType: "municipal", accountIndex: 5 });
      settlementGrid.init();
      settlementGrid.getElement().noRecordFoundComponent().should("not.exist");
      settlementGrid.getTotalItems("defaultTotalItems");
      settlementGrid.setStartDate(nineMonthsFromToday());
      settlementGrid.getElement().noRecordFoundComponent().should("not.exist");
      settlementGrid.getTotalItems("newTotalItems");
      pw.get("@defaultTotalItems").then((defaultTotalItems) => {
        pw.get("@newTotalItems").then((newTotalItems) => {
          expect(defaultTotalItems).to.not.equal(newTotalItems);
        });
      });
    });
  }
);
