import { defineConfig } from 'cypress';
import cypressSplit from "cypress-split";

export default defineConfig({
  //todo change the root url to dev
  env: {
    validCredentials: {
      taxpayer: {
        username: "valerasoftwares+taxpayer.1@gmail.com",
        password: "Ohayoworld.13"
    },
    municipal: {
        username: "valerasoftwares+remedios@gmail.com",
        password: "Ohayoworld.13"
    },
    ags: {
        username: "johnpatrickyusoresvalera+dev.super@gmail.com",
        password: "Ohayoworld.13"
    }
    },
    url: 'https://dev.azavargovapps.com/',
    backendRootUrl: 'https://5m5rny388d.execute-api.us-east-1.amazonaws.com',
    municipalityBackendUrl: 'https://aopbc94wjd.execute-api.us-east-1.amazonaws.com',
    getGovernmentNames:
      'https://5m5rny388d.execute-api.us-east-1.amazonaws.com/municipalityBusinesses/7ef6a937-5a7a-491e-ab24-296bfab5f885/all',
    getBusinessDetailsForCrestHill:
      'https://5m5rny388d.execute-api.us-east-1.amazonaws.com/municipalityBusinessConfig/7ef6a937-5a7a-491e-ab24-296bfab5f885',
    addSpecificBusinessToCrestHill:
      'https://5m5rny388d.execute-api.us-east-1.amazonaws.com/taxpayerBusiness/subscribe/7ef6a937-5a7a-491e-ab24-296bfab5f885/04E945D85714E3BE3166596059A0D0A70FA53AB7',
  },
  retries: {
    runMode: 2,
    openMode: 2,
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
  requestTimeout: 20000,
  responseTimeout: 20000,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 20000,
  projectId: '9jtkoa',
  e2e: {
    baseUrl: 'https://dev.azavargovapps.com/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      cypressSplit(on, config);
      return config;
    },
  },
});
