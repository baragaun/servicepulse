import appStore from '../appStore.js';
import loadServices from '../services/helpers/loadServices.js';

await loadServices();
const service = appStore.service('mmdata');

if (!service) {
  throw new Error('Service not found');
}
service!.sendAlert('', '', service.alerts[0]);
