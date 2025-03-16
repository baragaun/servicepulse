import express, { Express, Request, Response } from 'express'

import logger from './helpers/logger.js';
import loadServices from './services/helpers/loadServices.js';

let _app: Express;


async function main(): Promise<void> {
  try {
    logger.info('Starting application...');

    const services = await loadServices();

    for (const [name, service] of services) {
      logger.info(`Service ${name} loaded successfully`);
      service.schedule();
    }

    _app = express();
    const port = process.env.PORT || 8093;

    _app.get('/', (_req: Request, res: Response) => {
      res.json({ message: 'Welcome to Servicepulse' });
    });

    _app.listen(port, () => {
      logger.debug(`The server is running at http://localhost:${port}`);
    });

    // Handle application shutdown
    // process.on('SIGINT', () => handleShutdown(scheduler));
    // process.on('SIGTERM', () => handleShutdown(scheduler));

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

/**
 * Clean application shutdown
 */
// function handleShutdown(scheduler: CheckScheduler): void {
//   logger.info('Shutting down application...');
//   scheduler.cancelAllChecks();
//   logger.info('All checks cancelled');
//   process.exit(0);
// }

// Start the application
main().catch((error) => {
  logger.error('Unhandled exception:', error);
  process.exit(1);
});
