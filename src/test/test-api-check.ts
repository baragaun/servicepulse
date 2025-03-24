import appStore from '../appStore.js';
import { CheckType } from '../enums.js';
import loadServices from '../services/helpers/loadServices.js';

const serviceName = 'mmdata-dev';

await loadServices();
const service = appStore.service(serviceName);

if (!service) {
  throw new Error('Service not found');
}

const checkConfig = service.config.checks.find((check) => check.type === CheckType.bgServiceApi);

if (!checkConfig) {
  throw new Error('Check config not found');
}

const check = service.checks.find(j => j.config.type === CheckType.bgServiceApi);
await check!.run();
