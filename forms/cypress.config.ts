import { defineConfig } from "cypress";
import cypressOnFix from "cypress-on-fix";
import cypressSplit from "cypress-split";
import { sendToTeams } from "./cypress/utils/Reporting/sendToTeams";

export default defineConfig({
  projectId: "dvmbop",
  requestTimeout: 120000,
  responseTimeout: 120000,
  defaultCommandTimeout: 120000,
  pageLoadTimeout: 120000,
  taskTimeout: 120000,
  execTimeout: 120000,
  retries: {
    runMode: 2,
    openMode: 2,
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: true,
  env: {
    baseUrl: "https://dev.azavargovapps.com",
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
  },
  e2e: {
    baseUrl: "https://dev.azavargovapps.com",
    setupNodeEvents(cypressOn, config) {
      const on = cypressOnFix(cypressOn);
      // // implement node event listeners here
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
