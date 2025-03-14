import { ServiceHealth } from '../enums.ts'
import fetchJsonData from '../helpers/fetchJsonData.ts'
import { logger } from '../helpers/logger.ts'
import { ServiceConfig } from '../types/index.ts'
import { Job } from '../types/Job.ts';

export class BgServiceStatusJob extends Job {
  public async run(): Promise<void> {
    let json: any | undefined = undefined;

    try {
      const config: ServiceConfig = this._service.config;
      json = await fetchJsonData(config.status.url);
    } catch (err) {
      logger.error(`Error in job ${this._service.config.name}:`, err);
      this._service.setHealth(ServiceHealth.unreachable);
    }

    logger.debug('Fetched JSON data:', json);

    if (!json) {
      logger.error(`No JSON data found for ${this._service.config.name}`);
      this._service.setHealth(ServiceHealth.failedToParse);
      return;
    }

    if (json.status) {
      this._service.setHealth(json.status);
    }
  }
}
