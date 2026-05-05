import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer, I should only have details and delete as options in my action button column", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.getElementOfColumn(
      "Actions",
      "DBA",
      "Arrakis Spice Company 13685",
      "actionButton"
    );
    pw.get("@actionButton").click();
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
