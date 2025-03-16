import {
  BgNodeClient,
  BgNodeClientConfig,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

import { ServiceHealth } from '../../enums.js';
import appLogger from '../../helpers/logger.js';
import { BaseService } from '../../services/BaseService.js';
import { BgServiceApiJobConfig } from '../../types/index.js';
import { BaseJob } from '../BaseJob.js';
import { basicSignUp } from './basicSignUp.js';

const logger = appLogger.child({ scope: 'BgServiceApiJob' });

export class BgServiceApiJob extends BaseJob {
  private _bgNodeClient?: BgNodeClient;

  public constructor(config: BgServiceApiJobConfig, service: BaseService) {
    super(config, service);
  }

  public get name(): string {
    return 'bg-service-api';
  }

  public async run(): Promise<boolean> {
    if (this._config.enabled !== undefined && !this._config.enabled) {
      return false;
    }

    this._health = ServiceHealth.unknown;
    this._reason = '';
    this._running = true;

    if (!this._bgNodeClient) {
      await this.init();

      if (!this._bgNodeClient) {
        logger.error('BgServiceApiJob.run: failed to create BgNodeClient.');
        this._health = ServiceHealth.unknown;
        this._running = false;

        return false;
      }
    }

    return basicSignUp(this._bgNodeClient, this);
  }

  private async init(): Promise<void> {
    if (this._bgNodeClient) {
      return;
    }

    if (!this._service) {
      return;
    }

    const config: BgNodeClientConfig = {
      inBrowser: false,
      fsdata: {
        url: (this._config as BgServiceApiJobConfig).url,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };

    try {
      this._bgNodeClient = await new BgNodeClient().init(
        config,
        undefined,
        undefined,
        logger,
      );
    } catch (error) {
      logger.error('BgServiceApiJob: Error initializing BgNodeClient',
        { config: this.config, error });
      return;
    }

    return;
  }
}
