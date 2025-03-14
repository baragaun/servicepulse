import { JobType } from '../../enums.js';
import logger from '../../helpers/logger.js';
import { BaseService } from '../../services/BaseService.js';
import { BaseJob } from '../BaseJob.js';
import { BgServiceE2eJob } from '../BgServiceE2eJob.js';
import { BgServiceStatusJob } from '../BgServiceStatusJob.js';

const jobFactory = (
  jobType: JobType,
  service: BaseService,
): BaseJob | null => {
  if (jobType === JobType.bgdataE2e) {
    return new BgServiceE2eJob(service);
  }
  if (jobType === JobType.bgdataStatus) {
    return new BgServiceStatusJob(service);
  }

  logger.error(`Job type ${jobType} not found for ${service.name}`);

  return null;
}

export default jobFactory;
