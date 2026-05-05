const { defineConfig } = require("cypress");
const { sendToTeams } = require("./sendToTeams");
// const fs = require("fs");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    overwrite: false,
    html: false,
    json: true,
    saveJson: true,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // require("cypress-mochawesome-reporter/plugin")(on);

      // on("after:spec", async (spec, results) => {
      //   if (
      //     results &&
      //     results.stats &&
      //     results.stats.failures > 0
      //   ) {
      //     console.log("spec", spec);
      //     await sendToTeams(results.tests, spec)
      //       .then((response) => {
      //         console.log("Adaptive Card posted to Teams:", response.data);
      //       })
      //       .catch((error) => {
      //         console.error("Error posting Adaptive Card to Teams:", error);
      //       });
      //   }
      // });
    },
  },
});
