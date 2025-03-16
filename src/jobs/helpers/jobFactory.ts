import { JobType } from '../../enums.js';
import logger from '../../helpers/logger.js';
import { BaseService } from '../../services/BaseService.js';
import {
  BaseJobConfig,
  BgServiceApiJobConfig,
  BgServiceStatusJobConfig,
} from '../../types/index.js';
import { BaseJob } from '../BaseJob.js';
import { BgServiceApiJob } from '../BgServiceApiJob/BgServiceApiJob.js';
import { BgServiceStatusJob } from '../BgServiceStatusJob.js';

const jobFactory = (
  config: BaseJobConfig,
  service: BaseService,
): BaseJob | null => {
  if (config.type === JobType.bgServiceApi) {
    return new BgServiceApiJob(config as BgServiceApiJobConfig, service);
  }
  if (config.type === JobType.bgServiceStatus) {
    return new BgServiceStatusJob(config as BgServiceStatusJobConfig, service);
  }

  logger.error('jobFactory: Job type not found', { config });

  return null;
}

export default jobFactory;
