import { waitForLoading } from "../../support/runtime";

const interceptHubspotChat = async () => undefined;
const interceptLeadFlowConfig = async () => undefined;
const interceptAwsCognito = async () => undefined;

const waitForHubspotChat = async () => waitForLoading();
const waitForLeadFlowConfig = async () => waitForLoading();
const waitForAwsCognito = async (_isMultipleWait = true) => waitForLoading();

export default {
  interceptAwsCognito,
  interceptHubspotChat,
  interceptLeadFlowConfig,
  waitForAwsCognito,
  waitForHubspotChat,
  waitForLeadFlowConfig,
};
