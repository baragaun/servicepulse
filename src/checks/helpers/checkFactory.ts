import { CheckType } from '../../enums.js';
import logger from '../../helpers/logger.js';
import { BaseService } from '../../services/BaseService.js';
import {
  BaseCheckConfig,
  BgServiceApiCheckConfig,
  BgServiceStatusCheckConfig,
} from '../../types/index.js';
import { BaseCheck } from '../BaseCheck.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck/BgServiceApiCheck.js';
import { BgServiceStatusCheck } from '../BgServiceStatusCheck.js';

const checkFactory = (
  config: BaseCheckConfig,
  service: BaseService,
): BaseCheck | null => {
  if (config.type === CheckType.bgServiceApi) {
    return new BgServiceApiCheck(config as BgServiceApiCheckConfig, service);
  }
  if (config.type === CheckType.bgServiceStatus) {
    return new BgServiceStatusCheck(config as BgServiceStatusCheckConfig, service);
  }

  logger.error('checkFactory: Check type not found', { config });

  return null;
}

export default checkFactory;
