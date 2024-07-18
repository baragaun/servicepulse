import cors from 'cors';
import express, { Express } from 'express';
import fs from 'fs';
import helmet from 'helmet';
import { pino } from 'pino';

import { BgServicePulseConfig } from '@/definitions';
import { env } from '@/common/utils/envConfig';
import { ServiceList } from '@/services/ServiceList';
import appData from '@/appData';
import errorHandler from '@/common/middleware/errorHandler';
import initRunE2eTestsRouteRoute from '@/routes/runE2eTestsRoute';
import initStatusRoute from '@/routes/statusRoute';
import initVerifyStatusRoute from '@/routes/verifyStatusRoute';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';

const logger = pino({ name: 'server start' });

const json = fs.readFileSync('config/config.json', 'utf8');
const config = JSON.parse(json.toString()) as BgServicePulseConfig;

const services = new ServiceList(config);
appData.setServiceList(services);

const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
initStatusRoute(app, '/status');
initVerifyStatusRoute(app, '/verify-status');
initRunE2eTestsRouteRoute(app, '/e2e-tests');

// Error handlers
app.use(errorHandler());

export { app, logger };
