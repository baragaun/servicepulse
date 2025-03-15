import { ServiceType } from '../enums.js';

export interface BaseJobConfig {
  type: string;
  schedule: string;
}

export interface BgServiceApiJobConfig extends BaseJobConfig {
  url: string;
}

export interface BgServiceStatusJobConfig extends BaseJobConfig {
  url: string;
}

export interface BaseServiceConfig {
  name: string;
  type: ServiceType;
  enabled: boolean;
  alertIntervalInMinutes: number;
  alertRecipients: string[];
  jobs: BaseJobConfig[]
}

export interface BgDataServiceConfig extends BaseServiceConfig {
}
