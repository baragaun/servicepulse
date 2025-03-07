import fs from "fs";
import { LogLevel, run } from "@baragaun/e2e";
import type { E2eTestSuiteConfig } from "@baragaun/e2e/lib/definitions";

const configPath = process.env.E2E_TEST_SUITE_CONFIG_PATH ?? "config/mmdata/config.json";

let config: E2eTestSuiteConfig;
const logLevel = LogLevel.error;
let result: string;

const check = () => {
  if (!configPath) {
    return;
  }

  const json = fs.readFileSync(configPath, "utf8");

  if (!json) {
    console.error("run: failed to load config from file.", { configPath });
    return;
  }

  try {
    config = JSON.parse(json.toString()) as E2eTestSuiteConfig;
  } catch (error) {
    console.error("run: failed to parse config file.", { configPath, error });
    return;
  }

  run(config, logLevel).then((newResult) => {
    result = newResult;
  });
};

const getStatus = () => result;

export { check, getStatus };
