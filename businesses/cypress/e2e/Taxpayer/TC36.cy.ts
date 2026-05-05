import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

describe("As a taxpayer, I should only have details and delete as options in my action button column", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.getElementOfColumn(
      "Actions",
      "DBA",
      "Arrakis Spice Company 13685",
      "actionButton"
    );
    cy.get("@actionButton").click();
    taxpayerBusinessList
      .getElement()
      .anyList()
      .contains("View Details")
      .should("exist");
    taxpayerBusinessList
      .getElement()
      .anyList()
      .contains("Delete")
      .should("exist");
  });
});
