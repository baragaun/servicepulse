import { CheckScheduler } from './checks/helpers/CheckScheduler.js'
import { BaseService } from './services/BaseService.js'

const _services = new Map<string, BaseService>();
const _checkScheduler = new CheckScheduler();

const appStore = {
  service: (name: string): BaseService | undefined => _services.get(name),

  services: () => _services,

  setService: (service: BaseService): void => {
    _services.set(service.name, service);
  },

  checkScheduler: () => _checkScheduler,
}

export default appStore;
