import { BgNodeClient } from '@baragaun/bg-node-client';

import { ServiceHealth } from '../../enums.js';
import appLogger from '../../helpers/logger.js';
import { BaseService } from '../../services/BaseService.js';
import { BgServiceApiCheckConfig } from '../../types/index.js';
import { BaseCheck } from '../BaseCheck.js';
import { basicAccountSignUp } from './basicAccountSignUp.js';
import clientStore from '../../helpers/clientStore.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export class BgServiceApiCheck extends BaseCheck {
  private _bgNodeClient?: BgNodeClient;

  public constructor(config: BgServiceApiCheckConfig, service: BaseService) {
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
        logger.error('BgServiceApiCheck.run: failed to create BgNodeClient.');
        this._health = ServiceHealth.unknown;
        this._running = false;

        return false;
      }
    }

    return basicAccountSignUp(this._bgNodeClient, this);
  }

  private async init(): Promise<void> {
    if (this._bgNodeClient) {
      return;
    }

    if (!this._service) {
      return;
    }

    try {
      this._bgNodeClient = await clientStore.getBgNodeClient(
        (this._config as BgServiceApiCheckConfig).url,
        false,
      );
    } catch (error) {
      logger.error('BgServiceApiCheck: Error initializing BgNodeClient',
        { config: this.config, error: (error as Error).message, stack: (error as Error).stack });
      return;
    }

    return;
  }
}
