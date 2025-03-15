import { ServiceHealth } from '../enums.js';
import { BaseJob } from './BaseJob.js';
import fetchJsonData from '../helpers/fetchJsonData.js';
import appLogger from '../helpers/logger.js';
import { BaseService } from '../services/BaseService.js';
import { BgDataService } from '../services/BgDataService.js';
import { BgServiceStatusJobConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BgServiceStatusJob' });

export class BgServiceStatusJob extends BaseJob {
  public constructor(config: BgServiceStatusJobConfig, service: BaseService) {
    super(config, service);
  }

  public async run(): Promise<void> {
    let json: any | undefined = undefined;

    try {
      logger.debug('Loading service status', { config: this._config });
      json = await fetchJsonData((this._config as BgServiceStatusJobConfig).url);
    } catch (err) {
      logger.error(`Error in job ${this._service.config.name}:`, err);
      this._service.setHealth(ServiceHealth.unreachable);
    }

    logger.debug('Fetched JSON data:', { json });

    if (!json) {
      logger.error(`No JSON data found for ${this._service.config.name}`);
      this._service.setHealth(ServiceHealth.failedToParse);
      return;
    }

    if (json.status) {
      (this._service as BgDataService).serviceStatusReport = json;
      this._service.setHealth(json.status);
    }
  }

  public get name(): string {
    return 'bg-service-status';
  }
}
