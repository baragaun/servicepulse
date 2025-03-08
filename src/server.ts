import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

// import { check, getStatus } from './services/mmdata';
import { env } from "@/common/utils/envConfig";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
// import { scheduler } from './scheduler';
import { ServicePulse } from "@/servicePulse/ServicePulse";
import { serviceStatusRouter } from "@/api/serviceStatus/serviceStatusRouter";
import { userRouter } from "@/api/user/userRouter";
import appData from "@/appData";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";

const logger = pino({ name: "server start" });

const servicePulse = new ServicePulse();
servicePulse.init();
appData.setServicePulse(servicePulse);

const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/service-status", serviceStatusRouter);

// Swagger UI
app.use(openAPIRouter);

// initStatusRoute(app, '/status');
// initVerifyStatusRoute(app, '/verify-status');
// initRunE2eTestsRouteRoute(app, '/e2e-tests');

// Error handlers
app.use(errorHandler());

// Schedule a recurring task - every 10 minutes
// scheduler.scheduleJob('service-pulse', '*/10 * * * *', () => {
//   console.log(`service-pulse: execution started at ${new Date().toISOString()}`);
//   check();
//   const result = getStatus();
//   console.log(`service-pulse: execution completed at ${new Date().toISOString()} with result ${result} `);
// });

export { app, logger };
