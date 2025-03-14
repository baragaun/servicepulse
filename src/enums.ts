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
  bgdataStatus = 'bgdataStatus',
  bgdataE2e = 'bgdataE2e',
}
