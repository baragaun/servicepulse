import { ServiceConfig, ServicePulseConfig } from "@/types";
import fs from "fs";
import path from "path";

const DEFAULT_CONFIG_PATH = 'config/appConfig.json';
let _appConfig: ServicePulseConfig | null | undefined;

const loadAppConfig = (
  configPath = DEFAULT_CONFIG_PATH,
): ServicePulseConfig | undefined => {
  if (_appConfig === null) {
    // We tried to load it, but failed:
    return;
  }

  if (!_appConfig) {
    if (!configPath) {
      configPath = DEFAULT_CONFIG_PATH;
    }
    const directory = path.dirname(configPath);

    try {
      const appConfigJson = fs.readFileSync(configPath, "utf8");

      if (!appConfigJson) {
        console.error("run: failed to load config from file.", { path: configPath });
        _appConfig = null;
        return;
      }

      _appConfig = JSON.parse(appConfigJson.toString()) as ServicePulseConfig;

      if (
        !_appConfig ||
        !Array.isArray(_appConfig.services) ||
        _appConfig.services.length < 1
      ) {
        console.error("loadServicesConfig: config is invalid.", { path: configPath });
        _appConfig = null;
        return;
      }

      for (let i = 0; i < _appConfig.services.length; i++) {
        const service = _appConfig.services[i];

        if (!service.name || !service.configPath) {
          console.error("loadServicesConfig: service is invalid.", { path: configPath });
          _appConfig = null;
          return;
        }

        const serviceConfigJson = fs.readFileSync(`${directory}/${service.configPath}`, "utf8");
        _appConfig.services[i] = JSON.parse(appConfigJson.toString()) as ServiceConfig;
      }
    } catch (error) {
      console.error("loadServicesConfig: failed to parse config file.", { path: configPath, error });
      _appConfig = null;
      return;
    }
  }

  return _appConfig;
}

export default loadAppConfig
