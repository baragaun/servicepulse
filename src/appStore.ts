import { AlertNotifier } from './AlertNotifier.ts'
import { BaseService } from './BaseService.ts'
import { JobScheduler } from './helpers/JobScheduler.ts'

const _services = new Map<string, BaseService>();
const _jobScheduler = new JobScheduler();
const _alertNotifier = new AlertNotifier();

const appStore = {
  alertNotifier: (): AlertNotifier => _alertNotifier,

  service: (name: string): BaseService | undefined => _services.get(name),

  setService: (service: BaseService): void => {
    _services.set(service.name, service);
  },

  jobScheduler: () => _jobScheduler,
}

export default appStore;
