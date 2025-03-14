import {
  BgNodeClient,
  BgNodeClientConfig,
  DbType,
  HttpHeaderName
} from '@baragaun/bg-node-client';

import { Job } from '../types/Job.ts';

export class BgServiceE2eJob extends Job {
  private _bgNodeClient?: BgNodeClient;

  public async init(): Promise<Job> {
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
      console.error('Error initializing BgNodeClient', error);
      return this;
    }

    return this;
  }

  public async run(): Promise<void> {

  }
}
