import { Service, ServiceConfig, VerifyStatusResult } from '@/definitions';
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

  public status(): Promise<any> {
    return statusImpl(this.config);
  }

  public async verifyStatus(): Promise<VerifyStatusResult> {
    const status = await this.status();
    return verifyStatusHelper(this.config.name, status, this.config.status);
  }
}
