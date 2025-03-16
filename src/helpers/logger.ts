import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

let logger: Logger | undefined = undefined;

export const setLogger = (newLogger: Logger): void => {
  if (logger) {
    logger.close();
  }

  logger = newLogger;
};

const level = process.env.LOG_LEVEL || 'info';
const transports: any[] = [];

//
// - Write all logs with importance level of `error` or higher to `error.log`
//   (i.e., error, fatal, but not other levels)
//
// new winston.transports.File({ filename: 'error.log', level: 'error' }),
//
// - Write all logs with importance level of `info` or higher to `combined.log`
//   (i.e., fatal, error, warn, and info, but not trace)
//
// new winston.transports.File({
//   filename: process.env.LOG_FILE || 'servicepulse.log',
// }),
transports.push(
  new DailyRotateFile({
    json: true,
    filename: process.env.LOG_FILE || 'servicepulse.log',
    dirname: process.env.LOG_DIR || 'logs',
  }),
);
transports.push(
  new winston.transports.Console({
    format: winston.format.json(),
  }),
);

logger = winston.createLogger({
  level,
  format: winston.format.json(),
  transports,
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
//  logger.add(new winston.transports.Console({
//    format: winston.format.simple(),
//  }));
// }

logger.debug('Logger initialized', { level });

export default logger as unknown as Logger;
