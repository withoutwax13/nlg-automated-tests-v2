const interceptAuditAuthLogin = () => {
  return cy
    .intercept("POST", "https://audit.api.localgov.org/v1/auth/login")
    .as("AuditAuthLogin");
};

const waitForAuditAuthLogin = () => {
  return pw.wait("@AuditAuthLogin");
};

const interceptDepartments = () => {
  return cy
    .intercept("GET", "https://audit.api.localgov.org/v1/departments/**")
    .as("getDepartments");
};

const waitForDepartments = () => {
  pw.wait("@getDepartments").its("response.statusCode").should("eq", 200);
  pw.wait("@getDepartments").its("response.statusCode").should("eq", 200);
  return cy
    .wait("@getDepartments")
    .its("response.statusCode")
    .should("eq", 200);
};

const interceptSelectedDepartment = () => {
  return cy
    .intercept("GET", "https://audit.api.localgov.org/v1/departments")
    .as("getSelectedDepartment");
};

const waitForSelectedDepartment = () => {
  return pw.wait("@getSelectedDepartment");
};

export default {
  interceptAuditAuthLogin,
  waitForAuditAuthLogin,
  interceptDepartments,
  waitForDepartments,
  interceptSelectedDepartment,
  waitForSelectedDepartment,
};
