import { E2eTestSuiteConfig, E2eTestSuiteResult, TestResult, ValidationCheck } from '@baragaun/e2e';

import { ServiceStatus, ServiceType } from '@/enums';

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: any;
}

export interface ServiceStatusCheck extends ValidationCheck {
  statusIfFail: ServiceStatus;
}

export interface ServiceStatusConfig {
  requests: HttpRequestConfig[];
  checkEverySeconds: number;
  checks: ServiceStatusCheck[];
}

export interface ServiceConfig {
  endpoint: string;
  name: string;
  type: ServiceType;
  enabled: boolean;
  status: ServiceStatusConfig;
  serviceStatusPath: string;
  e2eTests?: E2eTestSuiteConfig;
}

export interface Service {
  config: ServiceConfig;
  name(): string;
  enabled: () => boolean;
  statuses: () => Promise<any[]>;
  verifyStatuses: () => Promise<VerifyStatusResult[]>;
  runE2ETests: () => Promise<E2eTestSuiteResult | undefined>;
}

export interface HttpApiServiceConfig extends ServiceConfig {}

export interface BgServicePulseConfig {
  services: ServiceConfig[];
}

export interface VerifyStatusResult {
  serviceName: string;
  url: string;
  checks: TestResult[];
  newStatus: ServiceStatus;
}
