import {
  BgNodeClient,
  BgNodeClientConfig,
  DbType,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

// import { ServiceHealth } from '../enums.ts';
import appStore from '../appStore.ts';
import { BaseService } from '../BaseService.ts';
import { logger } from '../helpers/logger.ts';
import mailer from '../helpers/mailer.ts';
import { BgServiceE2eJob } from '../jobs/BgServiceE2eJob.ts';
import { BgServiceStatusJob } from '../jobs/BgServiceStatusJob.ts';
import { ServiceConfig } from '../types/index.ts';

export class BgDataService extends BaseService {
  protected _bgNodeClient?: BgNodeClient;

  public constructor(config: ServiceConfig) {
    super(config);

    const bgNodeClientConfig: BgNodeClientConfig = {
      dbType: DbType.rxdb,
      inBrowser: false,
      fsdata: {
        url: config.api.url,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };

    new BgNodeClient().init(bgNodeClientConfig).then((client: BgNodeClient) => {
      this._bgNodeClient = client;
    }, (error: Error) => {
      logger.error('Error initializing BgNodeClient', error);
    });
  }

  public schedule(): void {
    const scheduler = appStore.jobScheduler();

    if (this._config.status.schedule) {
      // Schedule some example jobs
      scheduler.scheduleCron(`${this._config.name}.status`, this._config.status.schedule, () => {
        const job = new BgServiceStatusJob(this);
        job.run().catch((err: Error) => {
          logger.error(`Error in job ${this._config.name}:`, err);
          mailer.send();
        });
      });
    }

    if (this._config.api.schedule) {
      // Schedule some example jobs
      scheduler.scheduleCron(`${this._config.name}.api`, this._config.api.schedule, () => {
        const job = new BgServiceE2eJob(this);
        job.run().catch((err: Error) => {
          logger.error(`Error in job ${this._config.name}:`, err);
          mailer.send();
        });
      });
    }
  }

  public get bgNodeClient(): BgNodeClient | undefined {
    return this._bgNodeClient;
  }
}
