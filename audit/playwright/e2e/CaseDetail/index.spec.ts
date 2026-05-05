import { test, expect } from '../../support/pwtest';
import CaseDetails from "../../utils/CaseDetails";
import Login from "../../utils/Login";

const {
  interceptAuditXhr,
  waitForAuditXhr,
  interceptCaseFields,
  waitForCaseFields,
  interceptUsers,
  waitForUsers,
} = CaseDetails;

const interceptXhrForCaseDetail = () => {
  interceptAuditXhr();
  interceptCaseFields();
  interceptUsers();
  Login.interceptSelectedDepartment();
};

const waitForXhrForCaseDetail = () => {
  waitForAuditXhr();
  waitForCaseFields();
  waitForUsers();
  Login.waitForSelectedDepartment();
};

const caseDetailsXpathSelectors = {
  caseInfo: {
    caseType: `//h5[contains(text(), "Case Type")]/parent::span/parent::label//div/span`,
    government: `//h5[contains(text(), "Government")]/parent::span/parent::label//div/span`,
    caseName: `//h5[contains(text(), "Case Name")]/parent::span/parent::label//div/span`,
    assignee: `//h5[contains(text(), "Assignee Name")]/parent::span/parent::label//div/span`,
    status: `//a[@href="/cases"]//button/parent::a/parent::div//div//div[2]`,
  },
};

const saveRowData = ($row) => {
  const data = {};
  const columns = ["caseName", "government", "caseType", "assignee", "status", "updatedDate"];
  columns.forEach((col, index) => {
    cy.wrap($row)
      .find("td")
      .eq(index + 1)
      .invoke("text")
      .then((text) => {
        data[col] = text;
      });
  });
  return data;
};

const assertCaseDetails = (data) => {
  Object.keys(caseDetailsXpathSelectors.caseInfo).forEach((key) => {
    cy.xpath(caseDetailsXpathSelectors.caseInfo[key])
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.eq(data[key].trim());
      });
  });
  cy.xpath(`//span[contains(text(),"Activity History")]`)
    .should("be.visible")
    .click();
  cy.xpath(`//td[contains(text(),"${data.updatedDate}")]`).should("be.visible");
};

test.describe("Case Detail Scenarios", () => {
  test("As a user, I should be able to see that the column data in /cases grid are similar to the data in the /cases/{id}/info page", () => {
    cy.login();
    interceptXhrForCaseDetail();
    cy.location("pathname").should("include", "/cases");

    // Save the data of the first row in the table
    cy.get("tbody > tr")
      .first()
      .then(($row) => {
        const rowData = saveRowData($row);
        cy.wrap(rowData).as("rowData");
      });

    cy.get("tbody > tr").first().click();
    waitForXhrForCaseDetail();
    cy.location("pathname").should("include", "/cases/");
    cy.url().should("include", "/info");

    // Assert the data saved to the data in the case details page
    cy.get("@rowData").then((data) => {
      assertCaseDetails(data);
    });
  });
});