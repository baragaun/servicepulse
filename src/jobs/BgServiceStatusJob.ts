import { ServiceHealth } from '../enums.js';
import { BaseJob } from './BaseJob.js';
import fetchJsonData from '../helpers/fetchJsonData.js';
import appLogger from '../helpers/logger.js';
import { BgDataService } from '../services/BgDataService.js';
import { ServiceConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BgServiceStatus' });

export class BgServiceStatusJob extends BaseJob {
  public async run(): Promise<void> {
    let json: any | undefined = undefined;

    try {
      const config: ServiceConfig = this._service.config;
      logger.debug('Loading service status', { config: config.status });
      json = await fetchJsonData(config.status.url);
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
}
