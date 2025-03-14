import { ServiceType } from '../enums.js';

export interface ServiceConfig {
  name: string;
  type: ServiceType;
  enabled: boolean;
  status: {
    url: string;
    schedule: string;
  },
  api: {
    url: string;
    schedule: string;
  },
  isBgService: boolean;
  alertIntervalInMinutes: number;
  alertRecipients: string[];
}
