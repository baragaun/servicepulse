import appStore from '../appStore.js';
import { JobType } from '../enums.js';
import { BgServiceStatusJob } from '../jobs/BgServiceStatusJob.js';
import loadServices from '../services/helpers/loadServices.js';
import { BgServiceStatusJobConfig } from '../types/index.js';

await loadServices();
const service = appStore.service('mmdata');

if (!service) {
  throw new Error('Service not found');
}

const jobConfig = service.config.jobs.find((job) => job.type === JobType.bgServiceStatus);

if (!jobConfig) {
  throw new Error('Job config not found');
}

const job = new BgServiceStatusJob(
  jobConfig as BgServiceStatusJobConfig,
  service,
);
await job.run();
