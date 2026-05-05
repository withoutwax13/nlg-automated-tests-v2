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

const waitForHubspotChat = () => pw.wait("@hubspotChatAPI");
const waitForLeadFlowConfig = () => pw.wait("@leadFlowConfigAPI");
const waitForAwsCognito = (isMultipleWait = true) => {
  return isMultipleWait
    ? pw.wait(["@cognitoAwsAPI", "@cognitoAwsAPI"])
    : pw.wait("@cognitoAwsAPI");
};

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  waitForAwsCognito,
  waitForHubspotChat,
  waitForLeadFlowConfig,
};
