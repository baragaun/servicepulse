import appStore from '../appStore.js';
import { ServiceHealth } from '../enums.js';
import { AlertNotifier } from '../helpers/AlertNotifier.js';
import chooseMoreRelevantHealth from '../helpers/chooseMoreRelevantHealth.js';
import appLogger from '../helpers/logger.js';
import { BaseJob } from '../jobs/BaseJob.js';
import jobFactory from '../jobs/helpers/jobFactory.js';
import { Alert, BaseServiceConfig, ServiceHealthInfo } from '../types/index.js';

const logger = appLogger.child({ scope: 'BaseService' });

export class BaseService {
  protected _name: string = '';
  protected _config: BaseServiceConfig;
  protected _jobs: BaseJob[] = [];
  protected _health: ServiceHealthInfo = { overallHealth: ServiceHealth.unknown };
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

  public onJobFinished(): void {
    logger.debug('BaseService.onJobFinished called.', { name: this._name });

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
      tests: {},
      overallHealth: ServiceHealth.unknown,
    }

    if (!Array.isArray(this._jobs) || this._jobs.length < 1) {
      return this._health;
    }

    const readyJobs = this._jobs
      .filter(j => j.enabled && j.health !== ServiceHealth.unknown && !j.running);

    for (const job of readyJobs) {
      this._health.tests![job.name] = {
        health: job.health,
        reason: job.reason,
      }

      if (this._health.overallHealth === ServiceHealth.unknown) {
        this._health.overallHealth = job.health;
      } else {
        this._health.overallHealth = chooseMoreRelevantHealth(this._health.overallHealth, job.health);
      }

      if (job.health === ServiceHealth.failedToParse) {
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

    return this._health;
  }

  protected getAlertText(): string {
    if (
      !this._health ||
      !Array.isArray(this._health.tests) ||
      this._health.tests.length < 1
    ) {
      return '';
    }

    return this._health.tests
      .filter(t => t.reason)
      .map(t => t.reason)
      .join(',');
  }

  public get name(): string {
    return this._name;
  }

  public get config(): BaseServiceConfig {
    return this._config;
  }

  public get health(): ServiceHealthInfo {
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
    if (
      !this._health ||
      !Array.isArray(this._health.tests) ||
      this._health.tests.length < 1
    ) {
      return '';
    }

    return this._health.tests
      .filter(t => t.reason && !t.running)
      .map(t => t.reason)
      .join(',');
  }

  public get jobs(): BaseJob[] {
    return this._jobs;
  }

  public get alerts(): Alert[] {
    return this._alerts;
  }
}
