import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
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
    new winston.transports.Console({
      format: winston.format.simple(),
    }),

    new DailyRotateFile({
      json: true,
      filename: process.env.LOG_FILE || 'servicepulse.log',
      dirname: process.env.LOG_DIR || 'logs',
    }),
  ],
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

logger.debug('Logger initialized', { logLevel: process.env.LOG_LEVEL || 'info' });

export default logger;
