import appStore from '../appStore.js';
import { ServiceHealth } from '../enums.js';
import { AlertNotifier } from '../helpers/AlertNotifier.js';
import appLogger from '../helpers/logger.js';
import { BaseJob } from '../jobs/BaseJob.js';
import jobFactory from '../jobs/helpers/jobFactory.js';
import { Alert, BaseServiceConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BaseService' });

export class BaseService {
  protected _name: string = '';
  protected _config: BaseServiceConfig;
  protected _jobs: BaseJob[] = [];
  protected _health = ServiceHealth.unknown;
  protected _reason = '';
  protected _alertNotifier: AlertNotifier | undefined;
  protected _alerts: Alert[] = [];

  protected _limitedStartedAt?: Date;
  protected _offlineStartedAt?: Date;
  protected _unreachableStartedAt?: Date;
  protected _failedToParseStartedAt?: Date;

  public constructor(config: BaseServiceConfig) {
    this._name = config.name;
    this._config = config;

    if (Array.isArray(config.jobs) && config.jobs.length > 0) {
      for (const jobConfig of config.jobs) {
        const job = jobFactory(jobConfig, this);
        if (job) {
          this._jobs.push(job);
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
    const scheduler = appStore.jobScheduler();

    if (this._config.jobs.length < 1) {
      logger.error('No jobs found for service', { name: this._name });
      return;
    }

    for (const job of this._jobs) {
      const jobConfig = job.config;
      if (jobConfig.schedule) {
        scheduler.scheduleCron(`${this._config.name}.${jobConfig.type}`, jobConfig.schedule, () => {
          job.run().catch((err: Error) => {
            logger.error(`Error in job ${this._config.name}:`, err);
            // todo: save error into job?
          });
        });
      }
    }
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

    if (!alert.enabled) {
      return;
    }

    if (
      alert.lastSentAt &&
      alert.lastSentAt + (alert.intervalInMinutes || 60) * 60 * 1000 < Date.now()
    ) {
      return;
    }

    logger.info('Sending alert', { name: this._name, subject, text, alert });

    this._alertNotifier.sendAlert(
      subject || `Service alert for ${this._config.name} - status=${this._health}`,
      text || this.getAlertText() || JSON.stringify(this._config, null, 2),
      alert,
    ).catch((error) => {
      logger.error('sendAlert: error', { error, name: this._name, alert });
    });
  }

  public setHealth(health: ServiceHealth, reason: string): void {
    logger.debug('Setting service health', { name: this._name, health, reason });

    if (reason) {
      this._reason = reason;
    }

    if (health === this._health) {
      return;
    }

    if (health === ServiceHealth.limited) {
      if (!this._limitedStartedAt) {
        this._limitedStartedAt = new Date();
      }
    } else if (health === ServiceHealth.offline) {
      if (!this._offlineStartedAt) {
        this._offlineStartedAt = new Date();
      }
    } else if (health === ServiceHealth.failedToParse) {
      if (!this._failedToParseStartedAt) {
        this._failedToParseStartedAt = new Date();
      }
    } else if (health === ServiceHealth.unreachable) {
      if (!this._unreachableStartedAt) {
        this._offlineStartedAt = new Date();
      }
      this._unreachableStartedAt = new Date();
    } else if (health === ServiceHealth.ok) {
      delete this._limitedStartedAt;
      delete this._offlineStartedAt;
      delete this._failedToParseStartedAt;
      delete this._unreachableStartedAt;
      this._reason = '';
    }
    this._health = health;

    if (this._alerts.length > 0) {
      for (const alert of this._alerts) {
        if (alert.enabled) {
          this.sendAlert('', '', alert);
        }
      }
    }
  }

  protected getAlertText(): string {
    return this._reason;
  }

  public get name(): string {
    return this._name;
  }

  public get config(): BaseServiceConfig {
    return this._config;
  }

  public get health(): ServiceHealth {
    return this._health;
  }

  public get limitedStartedAt(): Date | undefined {
    return this._limitedStartedAt;
  }

  public get offlineStartedAt(): Date | undefined {
    return this._offlineStartedAt;
  }

  public get failedToParseStartedAt(): Date | undefined {
    return this._failedToParseStartedAt;
  }

  public get unreachableStartedAt(): Date | undefined {
    return this._unreachableStartedAt;
  }

  public get reason(): string {
    return this._reason;
  }

  public get jobs(): BaseJob[] {
    return this._jobs;
  }

  public get alerts(): Alert[] {
    return this._alerts;
  }
}
