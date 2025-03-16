import { BaseService } from './BaseService.js';
import logger from '../helpers/logger.js';

export class BgDataService extends BaseService {
  protected _serviceStatusReport?: any;

  protected getAlertText(): string {
    let startedAtText = '';
    if (this._limitedStartedAt) {
      startedAtText = `Limited started at: ${this._limitedStartedAt.toLocaleString()}`;
    } else if (this._offlineStartedAt) {
      startedAtText = `Offline started at: ${this._offlineStartedAt.toLocaleString()}`;
    } else if (this._unreachableStartedAt) {
      startedAtText = `Unreachable started at: ${this._unreachableStartedAt.toLocaleString()}`;
    }
    return `Service: ${this._name}
    Health: ${this._health}
    Reason: ${this._reason || 'N/A'}
    ${startedAtText}
    Status report:
    ${JSON.stringify(this._serviceStatusReport, null, 2)}
    `;
  }

  public set serviceStatusReport(report: any | undefined) {
    this._serviceStatusReport = report;
    logger.debug('Service status report updated', { report });
  }
}
