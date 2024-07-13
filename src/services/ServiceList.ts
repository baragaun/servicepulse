import { BgServicePulseConfig, Service } from '@/definitions';
import serviceFactory from '@/services/serviceFactory';
import statusImpl from '@/services/status';

export class ServiceList {
  private readonly appConfig: BgServicePulseConfig;
  public services: Service[];

  public constructor(appConfig: BgServicePulseConfig) {
    this.appConfig = appConfig;
    this.services = appConfig.services
      .filter((serviceConfig) => serviceConfig.enabled)
      .map((serviceConfig) => serviceFactory(serviceConfig));
  }

  public status() {
    return statusImpl(this.services);
  }
}
