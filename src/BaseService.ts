import appStore from './appStore.ts';
import { ServiceHealth } from './enums.ts';
import { ServiceConfig } from './types/index.ts';

export abstract class BaseService {
  protected _name: string = '';
  protected _config: ServiceConfig;
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

  public schedule(): void {

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
        // defaults to 10 minutes:
        Date.now() > this._alarmSentOutAt.getTime() + (this._config.alertInterval || 600000)
      )
    ) {
      const alertNotifier = appStore.alertNotifier();
      alertNotifier.sendAlert(
        this._name,
        `Service alert for ${this._config.name}`,
        this._config,
      );
      this._alarmSentOutAt = new Date();
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
