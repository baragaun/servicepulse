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

  public async run(): Promise<boolean> {
    let json: any | undefined = undefined;

    this._health = ServiceHealth.unknown;
    this._reason = '';
    this._running = true;

    try {
      logger.debug('BgServiceStatusJob.run: loading service status.',
        { config: this._config });
      json = await fetchJsonData((this._config as BgServiceStatusJobConfig).url);
    } catch (error) {
      logger.error('BgServiceStatusJob.run: error in fetching.', { error });
      this._health = ServiceHealth.unreachable;
      this._running = false;
      this._service.onJobFinished();
      return false;
    }

    logger.debug('BgServiceStatusJob.run: fetched JSON data:', { json });

    if (!json) {
      logger.error('BgServiceStatusJob.run: no JSON data found.');
      this._health = ServiceHealth.failedToParse;
      this._reason = 'No JSON data found';
      this._running = false;
      this._service.onJobFinished();

      return false;
    }

    if (json.status) {
      logger.debug('BgServiceStatusJob.run: found status.',
        { status: json.status });
      (this._service as BgDataService).serviceStatusReport = json;
      this._health = json.status;
    }

    this._running = false;
    this._service.onJobFinished();

    return true;
  }

  public get name(): string {
    return 'bg-service-status';
  }
}
