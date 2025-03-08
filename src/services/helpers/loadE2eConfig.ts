import fs from "fs";
import type { E2eTestSuiteConfig } from "@baragaun/e2e/lib/definitions";

const loadE2eConfig = (
  serviceName: string
): E2eTestSuiteConfig | undefined => {
  const configPath = `config/services/${serviceName}/e2e-runner/config.json`;
  const json = fs.readFileSync(configPath, "utf8");

  if (!json) {
    console.error("run: failed to load config from file.", { configPath });
    return;
  }

  try {
    return JSON.parse(json.toString()) as E2eTestSuiteConfig;
  } catch (error) {
    console.error("loadE2eConfig: failed to parse config file.", { configPath, error });
    return;
  }
};

export default loadE2eConfig;
