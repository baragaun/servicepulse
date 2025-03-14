import { JobScheduler } from './jobs/helpers/JobScheduler.js'
import { BaseService } from './services/BaseService.js'

const _services = new Map<string, BaseService>();
const _jobScheduler = new JobScheduler();

const appStore = {
  service: (name: string): BaseService | undefined => _services.get(name),
  services: () => _services,

  setService: (service: BaseService): void => {
    _services.set(service.name, service);
  },

  jobScheduler: () => _jobScheduler,
}

export default appStore;
