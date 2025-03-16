import { ServiceHealth } from '../enums.js';
import { BaseCheck } from './BaseCheck.js';
import fetchJsonData from '../helpers/fetchJsonData.js';
import appLogger from '../helpers/logger.js';
import { BaseService } from '../services/BaseService.js';
import { BgDataService } from '../services/BgDataService.js';
import { BgServiceStatusCheckConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BgServiceStatusCheck' });

export class BgServiceStatusCheck extends BaseCheck {
  public constructor(config: BgServiceStatusCheckConfig, service: BaseService) {
    super(config, service);
  }

  public async run(): Promise<boolean> {
    let json: any | undefined = undefined;

    this._health = ServiceHealth.unknown;
    this._reason = '';
    this._running = true;

    try {
      logger.debug('BgServiceStatusCheck.run: loading service status.',
        { config: this._config });
      json = await fetchJsonData(this._config.url);
    } catch (error) {
      logger.error('BgServiceStatusCheck.run: error in fetching.', { error });
      this._health = ServiceHealth.unreachable;
      this._running = false;
      this._service.onCheckFinished();
      return false;
    }

    logger.debug('BgServiceStatusCheck.run: fetched JSON data:', { json });

    if (!json) {
      logger.error('BgServiceStatusCheck.run: no JSON data found.');
      this._health = ServiceHealth.failedToParse;
      this._reason = 'No JSON data found';
      this._running = false;
      this._service.onCheckFinished();

      return false;
    }

    if (json.status) {
      logger.debug('BgServiceStatusCheck.run: found status.',
        { status: json.status });
      (this._service as BgDataService).serviceStatusReport = json;
      this._health = json.status;
    }

    this._running = false;
    this._service.onCheckFinished();

    return true;
  }

  public get name(): string {
    return 'bg-service-status';
  }
}
