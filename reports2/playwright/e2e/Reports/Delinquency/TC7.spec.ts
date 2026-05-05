import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";

test.describe(
  "As a taxpayer, I should be able to submit a filing via delinquency list action button",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      pw.intercept("GET", "https://**.azavargovapps.com/forms/municipality/**").as(
        "getFilingForm"
      );
      const taxpayerDelinquencyGrid = new DelinquencyGrid({
        userType: "taxpayer",
      });
      pw.login({ accountType: "taxpayer" });
      taxpayerDelinquencyGrid.init();
      taxpayerDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
      taxpayerDelinquencyGrid.toggleActionButtonForNthDelinquencyItem(
        "Submit Now",
        1
      );
      pw.get("@getFilingForm").its("response.statusCode").should("eq", 200);
    });
  }
);
