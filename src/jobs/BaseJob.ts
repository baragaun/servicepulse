import { BaseService } from '../services/BaseService.js';

export abstract class BaseJob {
  protected _service: BaseService;

  public constructor(service: BaseService) {
    this._service = service;
  }

  public init(): Promise<BaseJob> { return Promise.resolve(this); }
  public abstract run(): Promise<void>;
}
