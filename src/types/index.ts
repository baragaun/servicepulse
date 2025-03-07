import { E2eTestSuiteConfig, type E2eTestSuiteResult, type TestResult, type ValidationCheck } from "@baragaun/e2e";

import type { ServiceStatus, ServiceType } from "@/enums";

export interface HttpRequestConfig {
  url: string;
  method?: "GET" | "POST";
  headers?: { [key: string]: string };
  data?: any;
}

export interface ServiceStatusCheck extends ValidationCheck {
  statusIfFail: ServiceStatus;
}

export interface ServiceStatusCheckConfig {
  requests: HttpRequestConfig[];
  checkEverySeconds: number;
  checks: ServiceStatusCheck[];
}

export interface ServiceConfig {
  name: string;
  type: ServiceType;
  enabled: boolean;
  endpoint: string;
  statusCheckConfig?: ServiceStatusCheckConfig;
  serviceStatusPath: string;
}

export interface Service {
  config: ServiceConfig;
  name(): string;
  statuses: () => Promise<any[]>;
  verifyStatuses: () => Promise<VerifyStatusResult[]>;
  runE2ETests?: () => Promise<E2eTestSuiteResult | undefined>;
}

export interface HttpApiServiceConfig extends ServiceConfig {}
export interface SecureIdServiceConfig extends ServiceConfig {}

export interface BgServicePulseConfig {
  services: ServiceConfig[];
}

export interface VerifyStatusResult {
  serviceName: string;
  url: string;
  checks: TestResult[];
  newStatus: ServiceStatus;
  createdAt: Date;
}
