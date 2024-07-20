import { bgE2eTestRunnerHelpers, BgE2eTestSuite, E2eTestSuiteConfig, E2eTestSuiteResult } from '@baragaun/e2e';

import { HttpRequestConfig, Service, ServiceConfig, VerifyStatusResult } from '@/definitions';
import { ServiceType } from '@/enums';

import verifyStatusHelper from './helpers/verifyStatus';

export class GenericService implements Service {
  public type = ServiceType.generic;
  protected readonly config: ServiceConfig;

  public constructor(serviceConfig: ServiceConfig) {
    this.config = serviceConfig;
  }

  public name(): string {
    return this.config.name;
  }

  public enabled(): boolean {
    return this.config.enabled;
  }

  protected async status(request: HttpRequestConfig): Promise<any> {
    if (!this.config) {
      console.error('GenericService.status: no config');
      return;
    }

    const { data } = await bgE2eTestRunnerHelpers.fetchJson(request);

    return {
      service: this.config.name,
      url: request.url,
      status: data,
    };
  }

  public statuses(): Promise<any[]> {
    const promises = this.config.status.requests.map((request) => this.status(request));
    return Promise.all(promises);
  }

  public async verifyStatuses(): Promise<VerifyStatusResult[]> {
    const statuses = await this.statuses();
    return statuses.map((status) => {
      const requestConfig = this.config.status.requests.find((r) => r.url === status.url);

      if (!requestConfig) {
        console.error('GenericService.verifyStatuses: failed to find requestConfig.');
        return verifyStatusHelper(this.config.name, status, this.config.status, { url: status.url });
      }

      return verifyStatusHelper(this.config.name, status, this.config.status, requestConfig);
    });
  }

  public async runE2ETests(): Promise<E2eTestSuiteResult | undefined> {
    const config: E2eTestSuiteConfig | undefined = this.config?.e2eTests;
    if (!config) {
      return;
    }
    const suite = new BgE2eTestSuite(config);
    return suite.run();
  }
}
