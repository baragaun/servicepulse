export enum ServiceHealth {
  unknown = 'unknown',
  ok = 'ok',
  limited = 'limited',
  offline = 'offline',
  unreachable = 'unreachable',
  failedToParse = 'failedToParse',
}

export enum ServiceType {
  bgdata = 'bgdata',
}

export enum JobType {
  bgServiceStatus = 'bg-service-status',
  bgServiceApi = 'bg-service-api',
}
