import appStore from '../appStore.ts';
import init from '../init.ts'
import { BgServiceStatusJob } from '../jobs/BgServiceStatusJob.ts';

await init();
const service = appStore.service('mmdata');

if (!service) {
  throw new Error('Service not found');
}

const job = await new BgServiceStatusJob(service).init();
await job.run();
