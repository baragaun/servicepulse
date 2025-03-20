import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

let logger: Logger | undefined = undefined;

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

// console.log('Logger:', { filename: process.env.LOG_FILE, dirname: process.env.LOG_DIR });

if (process.env.LOG_FILE) {
  try {
    transports.push(
      new DailyRotateFile({
        json: true,
        filename: process.env.LOG_FILE || 'servicepulse.log',
        dirname: process.env.LOG_DIR || 'logs',
      }),
    );
  } catch (error) {
    console.error('Error initializing logger file transport:', error);
  }
}

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

logger.debug('Logger initialized', { level });

export default logger as unknown as Logger;
