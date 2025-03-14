import { ServiceType } from '../enums.ts';

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
  alertInterval: number;
}
