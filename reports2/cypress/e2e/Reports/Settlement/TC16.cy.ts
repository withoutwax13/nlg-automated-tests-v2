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

describe(
  "As an AGS user, I should be able to generate a distribution details from a date range of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    it("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 5 });
      settlementGrid.init();
      settlementGrid.getElement().noRecordFoundComponent().should("not.exist");
      settlementGrid.getTotalItems("defaultTotalItems");
      settlementGrid.setStartDate(nineMonthsFromToday());
      settlementGrid.getElement().noRecordFoundComponent().should("not.exist");
      settlementGrid.getTotalItems("newTotalItems");
      cy.get("@defaultTotalItems").then((defaultTotalItems) => {
        cy.get("@newTotalItems").then((newTotalItems) => {
          expect(defaultTotalItems).to.not.equal(newTotalItems);
        });
      });
    });
  }
);
