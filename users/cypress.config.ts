import { defineConfig } from "cypress";
import cypressSplit from "cypress-split";
import cypressOnFix from "cypress-on-fix";
import { sendToTeams } from "./cypress/utils/Reporting/sendToTeams";

export default defineConfig({
  projectId: "572gsg",
  requestTimeout: 120000,
  responseTimeout: 120000,
  defaultCommandTimeout: 120000,
  pageLoadTimeout: 120000,
  taskTimeout: 120000,
  execTimeout: 120000,
  chromeWebSecurity: false,
  video: true,
  e2e: {
    baseUrl: "https://dev.azavargovapps.com/",
    setupNodeEvents(cypressOn, config) {
      const on = cypressOnFix(cypressOn);
      // implement node event listeners here
      // on("before:browser:launch", (browser = {}, launchOptions) => {
      //   prepareAudit(launchOptions);
      // });
      // on("task", {
      //   lighthouse: lighthouse((lighthouseReport) => {
      //     console.log(lighthouseReport); // raw lighthouse reports
      //   }),
      // });
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
    retries: {
      runMode: 2,
      openMode: 2,
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    env: {
      customThresholds: {
        performance: 60,
        accessibility: 80,
        "best-practices": 80,
        seo: 80,
      },
      desktopConfig: {
        formFactor: "desktop",
        screenEmulation: {
          width: 1920,
          height: 1080,
          deviceScaleRatio: 1,
          mobile: false,
          disable: false,
        },
      },
      baseUrl: "https://dev.azavargovapps.com",
      filing_backend_root:
        "https://r85bm3iy02.execute-api.us-east-1.amazonaws.com/",
      taxpayerMail: "feraswaraq+tax@gmail.com",
      emailPass: "Abcd!123",
      validCredentials: {
        taxpayer: [
          {
            username: "valerasoftwares+taxpayer.1@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.2@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.3@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.4@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.5@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.6@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.7@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.8@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.9@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.10@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+taxpayer.11@gmail.com",
            password: "Ohayoworld.13",
          }
        ],
        municipal: [
          {
            username: "valerasoftwares+arrakis@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.2@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.3@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.4@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.5@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.6@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.7@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.8@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.9@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.10@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.11@gmail.com",
            password: "Ohayoworld.13",
          },
        ],
        iatx: [
          {
            username: "valerasoftwares+arrakis@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.2@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.3@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.4@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.5@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.6@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.7@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.8@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.9@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.10@gmail.com",
            password: "Ohayoworld.13",
          },
        ],
        iail: [
          {
            username: "valerasoftwares+arrakis@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.2@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.3@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.4@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.5@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.6@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.7@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.8@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.9@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "valerasoftwares+arrakis.10@gmail.com",
            password: "Ohayoworld.13",
          },
        ],
        ags: [
          {
            username: "johnpatrickyusoresvalera+dev.super@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.2@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.3@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.4@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.5@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.6@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.7@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.8@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.9@gmail.com",
            password: "Ohayoworld.13",
          },
          {
            username: "johnpatrickyusoresvalera+dev.super.10@gmail.com",
            password: "Ohayoworld.13",
          },
        ],
      },
      testmail: {
        namespace: 'sg8pl',
        domain: 'inbox.testmail.app',
        apiKey: '410202ac-eca4-4322-ae69-e7f6357d9c3a',
        endpoint: 'https://api.testmail.app/api/json',
      }
    },
  },
});
