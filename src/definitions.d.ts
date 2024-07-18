import { E2eTestType, ServiceStatus, ServiceType } from '@/enums';

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: any;
}

export interface JsonValidationCheck {
  name: string;
  jsonPath: string;
  dataType: 'boolean' | 'date' | 'number' | 'string';
  targetVar?: string;
  shouldBeEmpty?: boolean;
  enabled?: boolean;

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

export interface ServiceStatusCheck extends JsonValidationCheck {
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
  e2eTests?: E2eTestSuite;
}

export interface Service {
  config: ServiceConfig;
  name(): string;
  enabled: () => boolean;
  statuses: () => Promise<any[]>;
  verifyStatuses: () => Promise<VerifyStatusResult[]>;
  runE2ETests: () => Promise<E2eTestSuiteResult | undefined>;
}

export interface GraphqlServiceConfig extends ServiceConfig {
}

export interface BgServicePulseConfig {
  services: ServiceConfig[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  expected?: string;
  found?: string;
}

export interface VerifyStatusResult {
  serviceName: string;
  url: string;
  checks: TestResult[];
  newStatus: ServiceStatus;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// E2E Testing:
export interface E2eTestSuite {
  endpoint?: string;
  vars: { [key: string]: string };
  headers?: { [key: string]: string };
  sequences: E2eTestSequence[];
}

export interface E2eTestSuiteResult {
  passed: boolean;
  checks: TestResult[];
}

export interface E2eTestResponseReadVarItem {
  name: string;
  scope: 'suite' | 'sequence';
  jsonPath: string;
}

export interface E2eTestResponse {
  readVars?: E2eTestResponseReadVarItem[];
  checks: JsonValidationCheck[];
}

export interface E2eTest {
  name?: string;
  type: E2eTestType;
  vars?: { [key: string]: string };
  waitMilliSecondsBefore?: number;
  waitMilliSecondsAfter?: number;
  enabled?: boolean;
}

export interface JsonHttpRequestE2eTest extends E2eTest {
  endpoint: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  data?: string;
  response: E2eTestResponse;
}

export interface E2eTestSequence {
  name: string;
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: { [key: string]: string };
  tests: E2eTest[];
  vars?: { [key: string]: string };
}
