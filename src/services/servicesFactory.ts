import { ServiceType } from "../enums.js";
import { BgDataService } from "./BgDataService.js";
import { BaseService } from "../BaseService.js";
import { logger } from "../helpers/logger.js";
import { ServiceConfig } from "../types/index.js";

const servicesFactory = (config: ServiceConfig): BaseService | null => {
  if (config.type === ServiceType.bgdata) {
    return new BgDataService(config);
  }

  logger.error(`Service type ${config.type} not found for ${config.name}`);

  return null;
}

export default servicesFactory;
