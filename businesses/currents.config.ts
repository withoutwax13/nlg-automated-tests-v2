import { CurrentsConfig } from "@currents/playwright";

const config: CurrentsConfig = {
  projectId: "XfBSmb",
  recordKey: process.env.CURRENTS_RECORD_KEY!
};

export default config;