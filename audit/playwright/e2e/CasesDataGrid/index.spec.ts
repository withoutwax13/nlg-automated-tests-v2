import { test, expect } from '../../support/pwtest';
const interceptSearchResults = () => {
  cy.intercept(
    "GET",
    "https://audit.api.localgov.org/v1/audits?**keyword=**"
  ).as("searchResults");
};

const waitForSearchResults = () => {
  cy.wait("@searchResults").its("response.statusCode").should("eq", 200);
  cy.wait(3000);
};

const loginAndSearch = (searchTerm) => {
  cy.login();
  interceptSearchResults();
  cy.get(`input[placeholder="Search..."]`).type(searchTerm);
  waitForSearchResults();
  cy.get("tbody > tr").each(($row) => {
    cy.wrap($row)
      .find("td")
      .eq(1)
      .invoke("text")
      .then(($caseName) => {
        expect($caseName.toLowerCase()).to.include(searchTerm.toLowerCase());
      });
  });
};

const sortAndCollectCases = (columnIndex, ascendingCases, descendingCases) => {
  const collectCases = (casesArray) => {
    cy.get("tbody")
      .find("tr")
      .each(($row) => {
        cy.wrap($row)
          .find("td")
          .eq(columnIndex)
          .invoke("text")
          .then(($case) => {
            casesArray.push($case);
          });
      });
  };

  // ascending
  cy.get("tr").find("th").eq(columnIndex).click();
  waitForSearchResults();
  collectCases(ascendingCases);

  // descending
  cy.get("tr").find("th").eq(columnIndex).click();
  waitForSearchResults();
  collectCases(descendingCases);
};

const verifySorting = (ascendingCases, descendingCases) => {
  cy.wrap(ascendingCases).each((caseItem, index) => {
    cy.wrap(caseItem).should(
      "eq",
      descendingCases[descendingCases.length - 1 - index]
    );
  });
};

test.describe("Data Grid Scenarios", () => {
  test("As a user, I should be able to view the data grid", () => {
    const columnHeaders = [
      "Case Name",
      "Government",
      "Case Type",
      "Assignee",
      "Status",
      "Last Updated",
    ];
    cy.login();
    cy.get("table").should("be.visible");
    cy.get("thead").find("tr").find("th").its("length").should("eq", 8);
    columnHeaders.forEach((header, headerIndex) => {
      cy.get("thead")
        .find("tr")
        .find("th")
        .eq(headerIndex + 1)
        .should("contain.text", header);
    });
    cy.get("tbody").should("be.visible");
  });

  test("As a user, I should be able to search the data grid", () => {
    const searchItems = [
      "dwight",
      "creve",
      "sales tax",
      "danny",
      "not started",
      "2024-03-05",
    ];
    cy.login();
    interceptSearchResults();
    searchItems.forEach((searchItem, index) => {
      cy.get(`input[placeholder="Search..."]`).type(searchItem);
      waitForSearchResults();
      cy.get("tbody > tr").each(($row) => {
        cy.wrap($row)
          .find("td")
          .eq(index + 1)
          .invoke("text")
          .then(($caseName) => {
            expect($caseName.toLowerCase()).to.include(searchItem);
          });
      });
      cy.get(`input[placeholder="Search..."]`).clear();
    });
  });

  const sortTests = [
    { description: "Case Name", columnIndex: 1 },
    { description: "Government", columnIndex: 2 },
    { description: "Case Type", columnIndex: 3 },
    { description: "Assignee", columnIndex: 4 },
    { description: "Status", columnIndex: 5 },
  ];

  sortTests.forEach(({ description, columnIndex }) => {
    test(`As a user, I should be able to sort the data grid by ${description}`, () => {
      loginAndSearch("dwight");

      let ascendingCases = [];
      let descendingCases = [];

      sortAndCollectCases(columnIndex, ascendingCases, descendingCases);
      verifySorting(ascendingCases, descendingCases);
    });
  });

  test("As a user, I should see different colors on each status data", () => {
    const status = [
      { name: "not started", color: "rgb(215, 86, 72)" },
      { name: "audit onboarding", color: "rgb(246, 189, 69)" },
      { name: "customer onboarding", color: "rgb(246, 189, 69)" },
      { name: "loa signed", color: "rgb(246, 189, 69)" },
      { name: "audit notice sent", color: "rgb(246, 189, 69)" },
      { name: "provider data received", color: "rgb(246, 189, 69)" },
      { name: "nda signed and sent", color: "rgb(246, 189, 69)" },
      { name: "audit complete", color: "rgb(85, 153, 112)" },
    ];

    cy.login();
    interceptSearchResults();

    cy.wrap(status).each((status) => {
      cy.get(`input[placeholder="Search..."]`).clear().type(status.name);
      waitForSearchResults();
      cy.get("tbody > tr").each(($row) => {
        cy.wrap($row)
          .find("td")
          .eq(5)
          .invoke("text")
          .then(($status) => {
            expect($status.toLowerCase()).to.include(status.name);
            cy.wrap($row)
              .find("td")
              .eq(5)
              .find("p")
              .should("have.css", "color", status.color);
          });
      });
    });
  });
});