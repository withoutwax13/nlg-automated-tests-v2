import axios from "axios";

const webhookUrl =
  "https://prod-126.westus.logic.azure.com:443/workflows/85d22c565d704fa5af8ec900cb065a95/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UZSN-8dpx4-K6vve1oM9ZzPBalrpotT2r0d9acQ3QJ0";

const createTestItem = (test, spec) => ({
  type: "Container",
  spacing: "Medium",
  items: [
    {
      type: "TextBlock",
      text: `=============================`,
      wrap: true,
      size: "Medium",
      weight: "Bolder",
      spacing: "ExtraLarge",
    },
    {
      type: "TextBlock",
      text: test.title[0],
      wrap: true,
      size: "Medium",
      weight: "Bolder",
    },
    {
      type: "TextBlock",
      text: test.title[1],
      wrap: true,
      size: "Medium",
      weight: "Bolder",
    },
    {
      type: "TextBlock",
      text: `File: ${spec.name}`,
      wrap: true,
      size: "Medium",
      weight: "Lighter",
    },
    {
      type: "TextBlock",
      text: `Status: ${test.state.toUpperCase()}`,
      wrap: true,
      size: "Medium",
      color: "Attention",
      weight: "Lighter",
    },
    {
      type: "TextBlock",
      text: test.displayError,
      wrap: true,
      size: "Medium",
      color: "Attention",
      weight: "Lighter",
    },
  ],
});

const formatTestsForAdaptiveCard = (data, spec) =>
  data
    .filter((test) => test.state === "failed")
    .map((test) => createTestItem(test, spec));

export const sendToTeams = async (tests, spec) => {
  const adaptiveCard = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.2",
          body: [
            {
              type: "TextBlock",
              text: "Forms Service | E2E Regression | Bug Report",
              weight: "Bolder",
              size: "Large",
              color: "Accent",
            },
            {
              type: "Container",
              spacing: "Medium",
              items: formatTestsForAdaptiveCard(tests, spec),
            },
          ],
        },
      },
    ],
  };
  return axios.post(webhookUrl, adaptiveCard);
};