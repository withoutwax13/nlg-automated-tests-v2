import { test, expect } from '../../support/pwtest';
const interceptSearchResults = () => {
  pw.intercept(
    "GET",
    "https://audit.api.localgov.org/v1/audits?**keyword=**"
  ).as("searchResults");
};

const waitForSearchResults = () => {
  pw.wait("@searchResults").its("response.statusCode").should("eq", 200);
  pw.wait(3000);
};

const loginAndSearch = (searchTerm) => {
  pw.login();
  interceptSearchResults();
  pw.get(`input[placeholder="Search..."]`).type(searchTerm);
  waitForSearchResults();
  pw.get("tbody > tr").each(($row) => {
    pw.wrap($row)
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
    pw.get("tbody")
      .find("tr")
      .each(($row) => {
        pw.wrap($row)
          .find("td")
          .eq(columnIndex)
          .invoke("text")
          .then(($case) => {
            casesArray.push($case);
          });
      });
  };

  // ascending
  pw.get("tr").find("th").eq(columnIndex).click();
  waitForSearchResults();
  collectCases(ascendingCases);

  // descending
  pw.get("tr").find("th").eq(columnIndex).click();
  waitForSearchResults();
  collectCases(descendingCases);
};

const verifySorting = (ascendingCases, descendingCases) => {
  pw.wrap(ascendingCases).each((caseItem, index) => {
    pw.wrap(caseItem).should(
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
    pw.login();
    pw.get("table").should("be.visible");
    pw.get("thead").find("tr").find("th").its("length").should("eq", 8);
    columnHeaders.forEach((header, headerIndex) => {
      pw.get("thead")
        .find("tr")
        .find("th")
        .eq(headerIndex + 1)
        .should("contain.text", header);
    });
    pw.get("tbody").should("be.visible");
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
    pw.login();
    interceptSearchResults();
    searchItems.forEach((searchItem, index) => {
      pw.get(`input[placeholder="Search..."]`).type(searchItem);
      waitForSearchResults();
      pw.get("tbody > tr").each(($row) => {
        pw.wrap($row)
          .find("td")
          .eq(index + 1)
          .invoke("text")
          .then(($caseName) => {
            expect($caseName.toLowerCase()).to.include(searchItem);
          });
      });
      pw.get(`input[placeholder="Search..."]`).clear();
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

    pw.login();
    interceptSearchResults();

    pw.wrap(status).each((status) => {
      pw.get(`input[placeholder="Search..."]`).clear().type(status.name);
      waitForSearchResults();
      pw.get("tbody > tr").each(($row) => {
        pw.wrap($row)
          .find("td")
          .eq(5)
          .invoke("text")
          .then(($status) => {
            expect($status.toLowerCase()).to.include(status.name);
            pw.wrap($row)
              .find("td")
              .eq(5)
              .find("p")
              .should("have.css", "color", status.color);
          });
      });
    });
  });
});