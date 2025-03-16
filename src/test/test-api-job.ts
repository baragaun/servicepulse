import appStore from '../appStore.js';
import { JobType } from '../enums.js';
import loadServices from '../services/helpers/loadServices.js';

await loadServices();
const service = appStore.service('mmdata');

if (!service) {
  throw new Error('Service not found');
}

const jobConfig = service.config.jobs.find((job) => job.type === JobType.bgServiceStatus);

if (!jobConfig) {
  throw new Error('Job config not found');
}

const job = service.jobs.find(j => j.config.type === JobType.bgServiceApi);
await job!.run();
