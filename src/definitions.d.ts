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
  request: HttpRequestConfig;
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
  enabled: () => boolean;
  status: () => Promise<any>;
}

export interface GraphqlServiceConfig extends ServiceConfig {
}

export interface BgServicePulseConfig {
  services: ServiceConfig[];
}
