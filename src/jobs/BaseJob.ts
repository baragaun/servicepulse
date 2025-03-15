import { BaseService } from '../services/BaseService.js';
import { BaseJobConfig } from '../types/index.js';

export abstract class BaseJob {
  protected _config: BaseJobConfig;
  protected _service: BaseService;

  public constructor(config: BaseJobConfig, service: BaseService) {
    this._config = config;
    this._service = service;
  }

  public abstract get name(): string;

  public abstract run(): Promise<void>;

  public get config(): BaseJobConfig {
    return this._config;
  }

  public get service(): BaseService {
    return this._service;
  }
}
