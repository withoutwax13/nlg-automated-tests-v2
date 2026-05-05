import { defineConfig } from "cypress";

export default defineConfig({
  requestTimeout: 20000,
  responseTimeout: 20000,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 60000,
  retries: {
    runMode: 2,
    openMode: 2,
  },
  e2e: {
    baseUrl: "https://audit.localgov.org/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
