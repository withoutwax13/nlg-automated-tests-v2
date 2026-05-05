import { defineConfig } from "cypress";
import cypressSplit from "cypress-split";
import cypressOnFix from "cypress-on-fix";
import { sendToTeams } from "./cypress/utils/Reporting/sendToTeams";

export default defineConfig({
  projectId: "d5mrgh",
  //todo change the root url to dev
  env: {
    url: "https://dev.azavargovapps.com/",
    backendRootUrl: "https://5m5rny388d.execute-api.us-east-1.amazonaws.com",
    municipalityBackendUrl:
      "https://aopbc94wjd.execute-api.us-east-1.amazonaws.com",
    getGovernmentNames:
      "https://5m5rny388d.execute-api.us-east-1.amazonaws.com/municipalityBusinesses/7ef6a937-5a7a-491e-ab24-296bfab5f885/all",
    getBusinessDetailsForCrestHill:
      "https://5m5rny388d.execute-api.us-east-1.amazonaws.com/municipalityBusinessConfig/7ef6a937-5a7a-491e-ab24-296bfab5f885",
    addSpecificBusinessToCrestHill:
      "https://5m5rny388d.execute-api.us-east-1.amazonaws.com/taxpayerBusiness/subscribe/7ef6a937-5a7a-491e-ab24-296bfab5f885/04E945D85714E3BE3166596059A0D0A70FA53AB7",
  },
  retries: {
    runMode: 2,
    openMode: 2,
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
  requestTimeout: 120000,
  responseTimeout: 120000,
  defaultCommandTimeout: 120000,
  pageLoadTimeout: 120000,
  taskTimeout: 120000,
  execTimeout: 120000,
  // video: true,
  e2e: {
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    baseUrl: "https://dev.azavargovapps.com/",
    setupNodeEvents(cypressOn, config) {
      const on = cypressOnFix(cypressOn);
      // implement node event listeners here
      // cypressSplit(on, config);
      // on("after:spec", async (spec, results) => {
      //   if (results && results.stats && results.stats.failures > 0) {
      //     await sendToTeams(results.tests, spec)
      //       .then((response) => {
      //         console.log("Adaptive Card posted to Teams");
      //       })
      //       .catch((error) => {
      //         console.error("Error posting Adaptive Card to Teams:", error);
      //       });
      //   }
      // });
      return config;
    },
  },
});
