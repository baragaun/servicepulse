import appStore from '../appStore.js';
import { BaseCheck } from '../checks/BaseCheck.js';
import checkFactory from '../checks/helpers/checkFactory.js';
import { ServiceHealth } from '../enums.js';
import { AlertNotifier } from '../helpers/AlertNotifier.js';
import chooseMoreRelevantHealth from '../helpers/chooseMoreRelevantHealth.js';
import appLogger from '../helpers/logger.js';
import { Alert, BaseServiceConfig, ServiceHealthInfo } from '../types/index.js';

const logger = appLogger.child({ scope: 'BaseService' });

export class BaseService {
  protected _name: string = '';
  protected _config: BaseServiceConfig;
  protected _checks: BaseCheck[] = [];
  protected _health: ServiceHealthInfo = { overallHealth: ServiceHealth.unknown };
  protected _serviceStatusReport?: any;

  protected _alertNotifier: AlertNotifier | undefined;
  protected _alerts: Alert[] = [];

  protected _limitedStartedAt?: Date;
  protected _offlineStartedAt?: Date;
  protected _unreachableStartedAt?: Date;
  protected _failedToParseStartedAt?: Date;

  public constructor(config: BaseServiceConfig) {
    this._name = config.name;
    this._config = config;

    if (Array.isArray(config.checks) && config.checks.length > 0) {
      for (const checkConfig of config.checks) {
        const check = checkFactory(checkConfig, this);
        if (check) {
          this._checks.push(check);
        }
      }
    }

    if (Array.isArray(config.alerts) && config.alerts.length > 0) {
      for (const alert of config.alerts) {
        this._alerts.push(alert as Alert);
      }
    }
  }

  public schedule(): void {
    const scheduler = appStore.checkScheduler();

    if (this._config.checks.length < 1) {
      logger.error('No checks found for service', { name: this._name });
      return;
    }

    for (const check of this._checks) {
      const checkConfig = check.config;
      if (checkConfig.schedule) {
        scheduler.scheduleCron(`${this._config.name}.${checkConfig.type}`, checkConfig.schedule, () => {
          check.run().catch((err: Error) => {
            logger.error(`Error in check ${this._config.name}:`, err);
            // todo: save error into check?
          });
        });
      }
    }
  }

  public onCheckFinished(): void {
    logger.debug('BaseService.onCheckFinished called.', { name: this._name });

    this.updateHealth();
    this.sendAlertIfNeeded();
  }

  public sendAlert(
    subject: string,
    text: string,
    alert: Alert,
  ): void {
    if (!this._alertNotifier) {
      this._alertNotifier = new AlertNotifier();

      if (!this._alertNotifier) {
        return;
      }
    }

    if (alert.enabled !== undefined && !alert.enabled) {
      return;
    }

    if (
      alert.lastSentAt &&
      alert.lastSentAt + (alert.intervalInMinutes || 60) * 60 * 1000 > Date.now()
    ) {
      return;
    }

    logger.info('Sending alert', { name: this._name, subject, text, alert });

    this._alertNotifier.sendAlert(
      subject || `Service alert for ${this._config.name} - status=${this._health.overallHealth}`,
      text || this.getAlertText() || JSON.stringify(this._config, null, 2),
      alert,
    ).catch((error) => {
      logger.error('sendAlert: error', { error, name: this._name, alert });
    });
  }

  protected sendAlertIfNeeded(): void {
    logger.debug('BaseService.sendAlertIfNeeded called.', { name: this._name });

    if (
      !this._health ||
      this._health.overallHealth === ServiceHealth.unknown ||
      this._health.overallHealth === ServiceHealth.ok
    ) {
      return;
    }

    if (this._alerts.length > 0) {
      for (const alert of this._alerts) {
        if (alert.enabled === undefined || alert.enabled) {
          this.sendAlert('', '', alert);
        }
      }
    }
  }

  public updateHealth(): ServiceHealthInfo {
    this._health = {
      checks: {},
      overallHealth: ServiceHealth.unknown,
    }

    if (!Array.isArray(this._checks) || this._checks.length < 1) {
      return this._health;
    }

    const readyChecks = this._checks
      .filter(j => j.enabled && j.health !== ServiceHealth.unknown && !j.running);

    for (const check of readyChecks) {
      this._health.checks![check.name] = {
        health: check.health,
        reason: check.reason,
      }

      if (this._health.overallHealth === ServiceHealth.unknown) {
        this._health.overallHealth = check.health;
      } else {
        this._health.overallHealth = chooseMoreRelevantHealth(this._health.overallHealth, check.health);
      }

      if (check.health === ServiceHealth.failedToParse) {
        return { overallHealth: ServiceHealth.failedToParse };
      }
    }

    if (this._health.overallHealth === ServiceHealth.limited) {
      if (!this._limitedStartedAt) {
        this._limitedStartedAt = new Date();
      }
    } else if (this._health.overallHealth === ServiceHealth.offline) {
      if (!this._offlineStartedAt) {
        this._offlineStartedAt = new Date();
      }
    } else if (this._health.overallHealth === ServiceHealth.failedToParse) {
      if (!this._failedToParseStartedAt) {
        this._failedToParseStartedAt = new Date();
      }
    } else if (this._health.overallHealth === ServiceHealth.unreachable) {
      if (!this._unreachableStartedAt) {
        this._offlineStartedAt = new Date();
      }
      this._unreachableStartedAt = new Date();
    } else if (this._health.overallHealth === ServiceHealth.ok) {
      delete this._limitedStartedAt;
      delete this._offlineStartedAt;
      delete this._failedToParseStartedAt;
      delete this._unreachableStartedAt;
    }

    logger.debug('BaseService.updateHealth finished.', { health: this._health });

    return this._health;
  }

  protected getAlertText(): string {
    if (
      !this._health?.checks ||
      this._health.overallHealth === ServiceHealth.unknown ||
      this._health.overallHealth === ServiceHealth.ok ||
      Object.keys(this._health.checks).length < 1
    ) {
      return '';
    }

    let startedAtText = '';
    if (this._limitedStartedAt) {
      startedAtText = `Limited started at: ${this._limitedStartedAt.toLocaleString()}`;
    } else if (this._offlineStartedAt) {
      startedAtText = `Offline started at: ${this._offlineStartedAt.toLocaleString()}`;
    } else if (this._unreachableStartedAt) {
      startedAtText = `Unreachable started at: ${this._unreachableStartedAt.toLocaleString()}`;
    }

    let reasonText = this.reason;
    if (reasonText && reasonText.length > 0) {
      reasonText = `Reason: ${reasonText}`;
    }

    return `Service: ${this._name}
    ------------------------------------------------------------
    Health: ${this._health.overallHealth}
    Health Details: ${JSON.stringify(this._health, null, 2)}
    ${reasonText}
    ${startedAtText}
    ------------------------------------------------------------
    Status report:
    ${JSON.stringify(this._serviceStatusReport, null, 2)}
    `;
  }

  public set serviceStatusReport(report: any | undefined) {
    this._serviceStatusReport = report;
    logger.debug('Service status report updated', { report });
  }

  public get name(): string {
    return this._name;
  }

  public get config(): BaseServiceConfig {
    return this._config;
  }

  public get reason(): string {
    if (
      !this._health ||
      !Array.isArray(this._health.checks) ||
      this._health.checks.length < 1
    ) {
      return '';
    }

    return this._health.checks
      .filter(t => t.reason && !t.running)
      .map(t => t.reason)
      .join(',');
  }

  public get checks(): BaseCheck[] {
    return this._checks;
  }

  public get alerts(): Alert[] {
    return this._alerts;
  }
}
