import { ServiceStatus, ServiceType } from '@/enums';

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers: { [key: string]: string };
}

export interface ServiceStatusCheck {
  name: string;
  statusIfFail: ServiceStatus;
  jsonPath: string;
  dataType: 'boolean' | 'date' | 'number' | 'string';

  // dataType = 'boolean':
  targetBooleanValue?: boolean;

  // dataType = 'Date':
  notBeforeDate?: Date;
  notAfterDate?: Date;

  // dataType = 'number':
  targetIntegerValue?: number;
  minNumericValue?: number;
  maxNumericValue?: number;

  // dataType = 'string':
  targetStringValue?: string;
  regexExpression?: string;
  regexFlags?: string;
}

export interface ServiceStatusRequestConfig {
  requests: HttpRequestConfig[];
  checkEverySeconds: number;
  checks: ServiceStatusCheck[];
}

export interface ServiceConfig {
  endpoint: string;
  name: string;
  type: ServiceType;
  enabled: boolean;
  status: ServiceStatusRequestConfig;
  serviceStatusPath: string;
}

export interface Service {
  config: ServiceConfig;
  name(): string;
  enabled: () => boolean;
  statuses: () => Promise<any[]>;
  verifyStatuses: () => Promise<VerifyStatusResult[]>;
}

export interface GraphqlServiceConfig extends ServiceConfig {
}

export interface BgServicePulseConfig {
  services: ServiceConfig[];
}

export interface StatusCheckResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface VerifyStatusResult {
  serviceName: string;
  url: string;
  checks: StatusCheckResult[];
  newStatus: ServiceStatus;
}
