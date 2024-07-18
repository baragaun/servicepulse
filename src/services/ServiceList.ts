import {
  BgServicePulseConfig,
  E2eTestSuiteResult,
  Service,
  VerifyStatusResult
} from '@/definitions'
import runE2eTestsImpl from '@/services/runE2eTests';
import serviceFactory from '@/services/serviceFactory';
import statusImpl from '@/services/status';
import verifyStatusImpl from '@/services/verifyStatus';

export class ServiceList {
  private readonly appConfig: BgServicePulseConfig;
  public services: Service[];

  public constructor(appConfig: BgServicePulseConfig) {
    this.appConfig = appConfig;
    this.services = appConfig.services
      .filter((serviceConfig) => serviceConfig.enabled)
      .map((serviceConfig) => serviceFactory(serviceConfig));
  }

  public status(): Promise<any> {
    return statusImpl(this.services);
  }

  public verifyStatus(): Promise<VerifyStatusResult[]> {
    return verifyStatusImpl(this.services);
  }

  public runE2eTests(): Promise<E2eTestSuiteResult[]> {
    return runE2eTestsImpl(this.services);
  }
}
