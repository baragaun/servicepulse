import { ServiceHealth, ServiceType } from '../enums.js';

export interface BaseJobConfig {
  url: string;
  type: string;
  schedule: string;
  enabled: boolean;
}

export interface BgServiceApiJobConfig extends BaseJobConfig {
}

export interface BgServiceStatusJobConfig extends BaseJobConfig {
}

export interface AlertRecipient {
  name: string;
  email: string;
  enabled: boolean;
}

export interface AlertConfig {
  intervalInMinutes: number;
  recipients: AlertRecipient[];
  enabled?: boolean;
}

export interface Alert extends AlertConfig {
  lastSentAt: number;
}

export interface BaseServiceConfig {
  name: string;
  type: ServiceType;
  enabled: boolean;
  alerts: AlertConfig[];
  jobs: BaseJobConfig[];
}

export interface ServiceHealthWithReason {
  health: ServiceHealth;
  reason?: string;
}

export interface ServiceHealthInfo {
  tests?: { [key: string]: ServiceHealthWithReason };
  overallHealth: ServiceHealth;
}

export interface BgDataServiceConfig extends BaseServiceConfig {
}
