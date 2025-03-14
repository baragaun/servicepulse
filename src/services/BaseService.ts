import { AlertNotifier } from '../AlertNotifier.js';
import { ServiceHealth } from '../enums.js';
import { ServiceConfig } from '../types/index.js';

export abstract class BaseService {
  protected _name: string = '';
  protected _config: ServiceConfig;
  protected _alertNotifier: AlertNotifier | undefined;
  protected _health = ServiceHealth.unknown;

  protected _limitedStartedAt?: Date;
  protected _offlineStartedAt?: Date;
  protected _unreachableStartedAt?: Date;
  protected _failedToParseStartedAt?: Date;
  protected _alarmSentOutAt?: Date;

  protected constructor(config: ServiceConfig) {
    this._name = config.name;
    this._config = config;
  }

  public schedule(): void {}

  public sendAlert(
    subject = '',
    text = '',
  ): void {
    if (!this._alertNotifier) {
      this._alertNotifier = new AlertNotifier();
    }

    this._alertNotifier.sendAlert(
      subject || `Service alert for ${this._config.name}`,
      text || JSON.stringify(this._config, null, 2),
      this._config,
    )
      .then(() => {
        this._alarmSentOutAt = new Date();
      })
      .catch(console.error);
  }

  public setHealth(health: ServiceHealth): void {
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
    }
    this._health = health;

    if (
      this._health !== ServiceHealth.ok &&
      (
        !this._alarmSentOutAt ||
        // defaults to 1 hour:
        Date.now() > this._alarmSentOutAt.getTime() + (this._config.alertIntervalInMinutes || 60) * 60 * 1000
      )
    ) {
      this.sendAlert();
    }
  }

  public get name(): string {
    return this._name;
  }

  public get config(): ServiceConfig {
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

  public get alarmSentOutAt(): Date | undefined {
    return this._alarmSentOutAt;
  }
}
