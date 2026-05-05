const interceptHubspotChat = () => {
  return cy
    .intercept("https://**.hubspot.com/livechat-public/**")
    .as("hubspotChatAPI");
};
const interceptLeadFlowConfig = () => {
  return cy
    .intercept("https://**.hubspot.com/lead-flows-config/**")
    .as("leadFlowConfigAPI");
};
const interceptAwsCognito = () => {
  return cy
    .intercept("POST", "https://cognito-idp.**.amazonaws.com/")
    .as("cognitoAwsAPI");
};

const waitForHubspotChat = () => cy.wait("@hubspotChatAPI");
const waitForLeadFlowConfig = () => cy.wait("@leadFlowConfigAPI");
const waitForAwsCognito = (isMultipleWait = true) => {
  return isMultipleWait
    ? cy.wait(["@cognitoAwsAPI", "@cognitoAwsAPI"])
    : cy.wait("@cognitoAwsAPI");
};

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  waitForAwsCognito,
  waitForHubspotChat,
  waitForLeadFlowConfig,
};
