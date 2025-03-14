import { BaseService } from "../BaseService.js";

export abstract class Job {
  protected _service: BaseService;

  public constructor(service: BaseService) {
    this._service = service;
  }

  public init(): Promise<Job> { return Promise.resolve(this); }
  public abstract run(): Promise<void>;
}
