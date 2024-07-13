import { HttpRequestConfig, Service, ServiceConfig, VerifyStatusResult } from '@/definitions'
import { ServiceType } from '@/enums';
import statusImpl from '@/services/generic/status';
import verifyStatusHelper from '@/services/helpers/verifyStatus';

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

  protected status(request: HttpRequestConfig): Promise<any> {
    return statusImpl(this.config, request);
  }

  public statuses(): Promise<any[]> {
    const promises = this.config.status.requests.map((request) => this.status(request));
    return Promise.all(promises);
  }

  public async verifyStatuses(): Promise<VerifyStatusResult[]> {
    const statuses = await this.statuses();
    return statuses.map((status) => {
      const requestConfig = this.config.status.requests.find(r => r.url === status.url);

      if (!requestConfig) {
        console.error('GenericService.verifyStatuses: failed to find requestConfig.');
        return verifyStatusHelper(
          this.config.name,
          status,
          this.config.status,
          { url: status.url },
        )
      }

      return verifyStatusHelper(
        this.config.name,
        status,
        this.config.status,
        requestConfig,
      )
    });
  }
}
