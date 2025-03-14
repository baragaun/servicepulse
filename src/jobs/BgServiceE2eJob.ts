import {
  BgNodeClient,
  BgNodeClientConfig,
  DbType,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

import { BaseJob } from './BaseJob.js';
import appLogger from '../helpers/logger.js';

const logger = appLogger.child({ scope: 'BgServiceE2eJob' });

export class BgServiceE2eJob extends BaseJob {
  private _bgNodeClient?: BgNodeClient;

  public async init(): Promise<BaseJob> {
    if (this._bgNodeClient) {
      return this;
    }

    if (!this._service) {
      return this;
    }

    const config: BgNodeClientConfig = {
      dbType: DbType.rxdb,
      inBrowser: true,
      fsdata: {
        url: this._service.config.api.url,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };

    try {
      this._bgNodeClient = await new BgNodeClient().init(config);
    } catch (error) {
      logger.error('Error initializing BgNodeClient', error);
      return this;
    }

    return this;
  }

  public async run(): Promise<void> {

  }
}
