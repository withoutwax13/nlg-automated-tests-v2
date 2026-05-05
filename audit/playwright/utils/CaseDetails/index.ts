const interceptAuditXhr = () => {
  return cy
    .intercept("GET", "https://audit.api.localgov.org/v1/audits/**")
    .as("getAudits");
};

const waitForAuditXhr = () => {
  return pw.wait("@getAudits");
};

const interceptCaseFields = () => {
  return cy
    .intercept(
      "GET",
      "https://audit.api.localgov.org/v1/fields?departmentTag=**"
    )
    .as("getCaseFields");
};

const waitForCaseFields = () => {
  return pw.wait("@getCaseFields");
};

const interceptUsers = () => {
  return cy
    .intercept("GET", "https://audit.api.localgov.org/v1/users")
    .as("getUsers");
};

const waitForUsers = () => {
  return pw.wait("@getUsers");
};

export default {
    interceptAuditXhr,
    waitForAuditXhr,
    interceptCaseFields,
    waitForCaseFields,
    interceptUsers,
    waitForUsers,
};
