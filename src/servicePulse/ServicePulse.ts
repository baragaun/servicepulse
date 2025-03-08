import type { E2eTestSuiteResult } from "@baragaun/e2e";

import type { Service, ServicePulseConfig, VerifyStatusResult } from "@/types";
import { Scheduler } from "@/scheduler";
import serviceFactory from "@/services/serviceFactory";
import loadAppConfig from "@/servicePulse/loadAppConfig";

export class ServicePulse {
  private appConfig: ServicePulseConfig | undefined;
  public services: Service[] = [];
  public scheduler: Scheduler;

  public constructor() {
    this.scheduler = new Scheduler();
    this.init();
  }

  public init(): void {
    this.appConfig = loadAppConfig();

    if (
      this.appConfig &&
      Array.isArray(this.appConfig.services) &&
      this.appConfig.services.length > 0
    ) {
      this.services = this.appConfig.services
        .filter((serviceConfig) => serviceConfig.enabled)
        .map((serviceConfig) => serviceFactory(serviceConfig));

      this.initServices();
    }
  }

  public initServices(): void {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return;
    }

    for (const service of this.services) {
      if (service.config.statusCronConfig && service.verifyStatuses) {
        const jobName = `${service.name()}-status`;
        this.scheduler.scheduleJob(jobName, service.config.e2eCronConfig, () => {
          console.log(`service-pulse: started ${jobName}`);
          service.verifyStatuses!().then(() => {
            console.log(`service-pulse: finished ${jobName}`);
          }, (error) => {
            console.error(`service-pulse: ${jobName} failed`, error);
          });
        });
      }

      if (service.config.e2eCronConfig && service.runE2ETests) {
        const jobName = `${service.name()}-e2e`;
        this.scheduler.scheduleJob(jobName, service.config.e2eCronConfig, () => {
          console.log(`service-pulse: started ${jobName}`);
          service.runE2ETests!().then(() => {
            console.log(`service-pulse: finished ${jobName}`);
          }, (error) => {
            console.error(`service-pulse: ${jobName} failed`, error);
          });
        });
      }
    }
  }

  public async verifyStatus(): Promise<VerifyStatusResult[]> {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return [];
    }

    const promises = this.services
      .filter((service) => service.enabled() && service.verifyStatuses)
      .map((service) => service.verifyStatuses && service.verifyStatuses());

    const results = await Promise.all(promises);

    return results
      .filter(r => r)
      .flat() as VerifyStatusResult[];
  }

  public async runE2eTests(): Promise<E2eTestSuiteResult[]> {
    if (!Array.isArray(this.services) || this.services.length < 1) {
      return [];
    }
    const promises = this.services
      .filter((service) => service.enabled() && service.runE2ETests)
      .map((service) => service.runE2ETests && service.runE2ETests());

    const result: (E2eTestSuiteResult | undefined)[] = (await Promise.all(promises)).flat();

    return result.filter((r) => r) as E2eTestSuiteResult[];
  }
}
