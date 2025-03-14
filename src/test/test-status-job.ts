import appStore from '../appStore.js';
import { BgServiceStatusJob } from '../jobs/BgServiceStatusJob.js';
import loadServices from '../services/helpers/loadServices.js';

await loadServices();
const service = appStore.service('mmdata');

if (!service) {
  throw new Error('Service not found');
}

const job = await new BgServiceStatusJob(service).init();
await job.run();
