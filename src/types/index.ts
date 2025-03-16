import { ServiceHealth, ServiceType } from '../enums.js';

export interface BaseCheckConfig {
  url: string;
  type: string;
  schedule: string;
  enabled: boolean;
}

export interface BgServiceApiCheckConfig extends BaseCheckConfig {
}

export interface BgServiceStatusCheckConfig extends BaseCheckConfig {
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
  checks: BaseCheckConfig[];
}

export interface ServiceHealthWithReason {
  health: ServiceHealth;
  reason?: string;
}

export interface ServiceHealthInfo {
  checks?: { [key: string]: ServiceHealthWithReason };
  overallHealth: ServiceHealth;
}

export interface BgDataServiceConfig extends BaseServiceConfig {
}
