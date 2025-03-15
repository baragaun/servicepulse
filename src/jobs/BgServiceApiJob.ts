import {
  BgNodeClient,
  BgNodeClientConfig,
  DbType,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

import { BaseJob } from './BaseJob.js';
import appLogger from '../helpers/logger.js';
import { BaseService } from '../services/BaseService.js';
import { BgServiceApiJobConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BgServiceApiJob' });

export class BgServiceApiJob extends BaseJob {
  private _bgNodeClient?: BgNodeClient;

  public constructor(config: BgServiceApiJobConfig, service: BaseService) {
    super(config, service);
  }

  public get name(): string {
    return 'bg-service-api';
  }

  public async run(): Promise<void> {
    if (!this._bgNodeClient) {
      await this.init();

      if (!this._bgNodeClient) {
        logger.error('BgNodeClient not initialized');
        return;
      }
    }

    // todo: implement the actual API call
  }

  private async init(): Promise<void> {
    if (this._bgNodeClient) {
      return;
    }

    if (!this._service) {
      return;
    }

    const config: BgNodeClientConfig = {
      dbType: DbType.rxdb,
      inBrowser: true,
      fsdata: {
        url: (this._config as BgServiceApiJobConfig).url,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };

    try {
      this._bgNodeClient = await new BgNodeClient().init(config);
    } catch (error) {
      logger.error('Error initializing BgNodeClient', error);
      return;
    }

    return;
  }
}
