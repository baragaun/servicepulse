import { ServiceType } from '../../enums.js';
import logger from '../../helpers/logger.js';
import { BaseServiceConfig } from '../../types/index.js';
import { BaseService } from '../BaseService.js';
import { BgDataService } from '../BgDataService.js';

const serviceFactory = (config: BaseServiceConfig): BaseService | null => {
  if (!config.type) {
    return new BaseService(config);
  }

  if (config.type === ServiceType.bgService) {
    return new BgDataService(config);
  }

  logger.error(`Service type ${config.type} not found for ${config.name}`);

  return null;
}

export default serviceFactory;
