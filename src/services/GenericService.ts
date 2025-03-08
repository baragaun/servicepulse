import { ServiceType } from "@/enums";
import type {
  HttpRequestConfig,
  Service,
  ServiceConfig,
  VerifyStatusResult,
} from "@/types";
import {
  BgE2eTestSuite,
  type E2eTestSuiteConfig,
  type E2eTestSuiteResult,
  bgE2eTestRunnerHelpers,
} from "@baragaun/e2e";
import loadE2eConfig from "./helpers/loadE2eConfig";
import verifyStatusHelper from "./helpers/verifyStatus";

export class GenericService implements Service {
  public serviceType = ServiceType.generic;
  public readonly config: ServiceConfig;
  protected e2eConfig: E2eTestSuiteConfig | undefined;

  public constructor(serviceConfig: ServiceConfig) {
    this.config = serviceConfig;
    this.e2eConfig = loadE2eConfig(serviceConfig.name);
  }

  public name(): string {
    return this.config.name;
  }

  public enabled(): boolean {
    return this.config.enabled;
  }

  protected async status(request: HttpRequestConfig): Promise<any> {
    if (!this.config) {
      console.error("GenericService.status: no config");
      return;
    }

    const { data } = await bgE2eTestRunnerHelpers.fetchJson(request);

    return {
      service: this.config.name,
      url: request.url,
      status: data,
    };
  }

  public async statuses(): Promise<any[]> {
    if (
      !Array.isArray(this.config.statusCheckConfig) ||
      this.config.statusCheckConfig.length < 1
    ) {
      return [];
    }
    const promises = this.config.statusCheckConfig
      .requests.map((request) => this.status(request));
    return Promise.all(promises);
  }

  public async verifyStatuses(): Promise<VerifyStatusResult[]> {
    if (
      !Array.isArray(this.config.statusCheckConfig) ||
      this.config.statusCheckConfig.length < 1
    ) {
      return [];
    }

    const statuses = await this.statuses();
    return statuses.map((status) => {
      const requestConfig = this.config.statusCheckConfig!.requests.find((r) => r.url === status.url);

      if (!requestConfig) {
        console.error("GenericService.verifyStatuses: failed to find requestConfig.");
        return verifyStatusHelper(this.config.name, status, this.config.statusCheckConfig!, { url: status.url });
      }

      return verifyStatusHelper(this.config.name, status, this.config.statusCheckConfig!, requestConfig);
    });
  }

  public async runE2ETests(): Promise<E2eTestSuiteResult | undefined> {
    if (!this.e2eConfig) {
      return;
    }

    const suite = new BgE2eTestSuite(this.e2eConfig);

    if (!suite) {
      console.error("GenericService.runE2ETests: failed to create suite.");
      return;
    }

    return suite.run();
  }
}
