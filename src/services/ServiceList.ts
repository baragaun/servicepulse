import type { E2eTestSuiteResult } from "@baragaun/e2e";

import serviceFactory from "@/services/serviceFactory";
import type { BgServicePulseConfig, Service, VerifyStatusResult } from "@/types";

export class ServiceList {
  private readonly appConfig: BgServicePulseConfig;
  public services: Service[];

  public constructor(appConfig: BgServicePulseConfig) {
    this.appConfig = appConfig;
    this.services = appConfig.services
      .filter((serviceConfig) => serviceConfig.enabled)
      .map((serviceConfig) => serviceFactory(serviceConfig));
  }

  public async status(): Promise<any> {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return;
    }
    const promises = this.services.filter((service) => service.config.enabled).map((service) => service.statuses());

    return Promise.all(promises);
  }

  public async verifyStatus(): Promise<VerifyStatusResult[]> {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return [];
    }
    const promises = this.services.filter((service) => service.config.enabled).map((service) => service.verifyStatuses());

    return (await Promise.all(promises)).flat();
  }

  public async runE2eTests(): Promise<E2eTestSuiteResult[]> {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return [];
    }
    const promises = this.services
      .filter((service) => service.config.enabled && service.runE2ETests)
      .map((service) => service.runE2ETests && service.runE2ETests());

    const result: (E2eTestSuiteResult | undefined)[] = (await Promise.all(promises)).flat();

    return result.filter((r) => r) as E2eTestSuiteResult[];
  }
}
