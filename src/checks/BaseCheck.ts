import { ServiceHealth } from '../enums.js';
import logger from '../helpers/logger.js';
import { BaseService } from '../services/BaseService.js';
import { BaseCheckConfig } from '../types/index.js';

export abstract class BaseCheck {
  protected _config: BaseCheckConfig;
  protected _service: BaseService;
  protected _health = ServiceHealth.unknown;
  protected _reason = '';
  protected _running = false;

  public constructor(config: BaseCheckConfig, service: BaseService) {
    this._config = config;
    this._service = service;
  }

  public setOffline(reason: string): boolean {
    logger.error('BgServiceApiCheck.run.setOffline called.', { reason });
    this._health = ServiceHealth.offline;
    this._reason = reason;
    this._running = false;
    this._service.onCheckFinished();

    return false;
  }

  public abstract get name(): string;

  public abstract run(): Promise<boolean>;

  public get config(): BaseCheckConfig {
    return this._config;
  }

  public get service(): BaseService {
    return this._service;
  }

  public get health(): ServiceHealth {
    return this._health;
  }

  public get reason(): string {
    return this._reason;
  }

  public get running(): boolean {
    return this._running;
  }

  public get enabled(): boolean {
    return this._config.enabled === undefined || this._config.enabled;
  }

  public set health(value: ServiceHealth) {
    this._health = value;
  }

  public set reason(value: string) {
    this._reason = value;
  }

  public set running(value: boolean) {
    this._running = value;
  }
}
