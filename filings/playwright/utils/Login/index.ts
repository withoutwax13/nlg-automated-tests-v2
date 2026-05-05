const noop = async () => undefined;

export default {
  interceptAwsCognito: noop,
  interceptHubspotChat: noop,
  interceptLeadFlowConfig: noop,
  waitForAwsCognito: noop,
  waitForHubspotChat: noop,
  waitForLeadFlowConfig: noop,
};
