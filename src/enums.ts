export enum ServiceHealth {
  unknown = 'unknown',
  ok = 'ok',
  limited = 'limited',
  offline = 'offline',
  unreachable = 'unreachable',
  failedToParse = 'failedToParse',
}

export enum ServiceType {
  bgService = 'bg-service',
}

export enum CheckType {
  bgServiceStatus = 'bg-service-status',
  bgServiceApi = 'bg-service-api',
}
